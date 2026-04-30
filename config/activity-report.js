const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('./helpers');

// Parse CLI arguments
const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return defaultValue;
  return args[idx + 1] || defaultValue;
}

const dateArg = getArg('date', null);
const format = getArg('format', 'console');
const outputArg = getArg('output', null);

// Determine date range (UTC)
let dayStart, dayEnd, dateLabel;
if (dateArg) {
  dayStart = `${dateArg}T00:00:00.000Z`;
  dayEnd = new Date(new Date(dayStart).getTime() + 86400000).toISOString();
  dateLabel = dateArg;
} else {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  dateLabel = `${y}-${m}-${d}`;
  dayStart = `${dateLabel}T00:00:00.000Z`;
  dayEnd = new Date(new Date(dayStart).getTime() + 86400000).toISOString();
}

// Generate the remote query script
const remoteScript = `
const { MongoClient } = require("mongodb");
async function main() {
  var uri = process.env.MONGO_URI;
  var client = new MongoClient(uri);
  await client.connect();
  var db = client.db("test");
  var dayStart = new Date("${dayStart}");
  var dayEnd = new Date("${dayEnd}");
  var filter = {"$gte": dayStart, "$lt": dayEnd};

  var convs = await db.collection("conversations")
    .find({updatedAt: filter})
    .sort({updatedAt: -1})
    .project({title: 1, conversationId: 1, user: 1, endpoint: 1, model: 1, createdAt: 1, updatedAt: 1})
    .toArray();

  var msgs = await db.collection("messages")
    .find({createdAt: filter})
    .sort({createdAt: 1})
    .project({createdAt: 1, sender: 1, conversationId: 1, model: 1, endpoint: 1, text: 1})
    .toArray();

  var users = await db.collection("users")
    .find({})
    .project({_id: 1, name: 1, username: 1, email: 1})
    .toArray();

  var result = {conversations: convs, messages: msgs, users: users};
  var json = JSON.stringify(result);
  process.stdout.write(Buffer.from(json).toString("base64"));
  await client.close();
}
main().catch(function(e) { console.error("Error:", e.message); process.exit(1); });
`;

// Base64-encode the remote script
const scriptB64 = Buffer.from(remoteScript).toString('base64');

// Ensure Railway CLI is linked
const projectDir = path.resolve(__dirname, '..');

console.purple('-----------------------------');
console.purple(`LibreChat Activity Report`);
console.purple(`Date: ${dateLabel}`);
console.purple('-----------------------------');
console.orange('Querying MongoDB via Railway SSH...');

let rawOutput;
try {
  const cmd = `railway ssh "printf ${scriptB64} > /app/ar.b64 && base64 -d /app/ar.b64 > /app/ar.js && node /app/ar.js"`;
  rawOutput = execSync(cmd, {
    cwd: projectDir,
    encoding: 'utf-8',
    timeout: 120000,
    maxBuffer: 50 * 1024 * 1024,
  });
} catch (err) {
  console.red('Failed to query MongoDB via Railway SSH.');
  console.red('Make sure Railway CLI is installed and linked to the librechat project:');
  console.red('  railway link --project <id> --environment production --service LibreChat');
  if (err.stdout) console.red('stdout: ' + err.stdout.substring(0, 500));
  if (err.stderr) console.red('stderr: ' + err.stderr.substring(0, 500));
  console.error(err.message);
  process.exit(1);
}

// Decode base64 output
let data;
try {
  const jsonStr = Buffer.from(rawOutput.trim(), 'base64').toString('utf-8');
  data = JSON.parse(jsonStr);
} catch (err) {
  console.red('Failed to parse response from Railway.');
  console.red('Raw output (first 500 chars): ' + (rawOutput || '').substring(0, 500));
  process.exit(1);
}

// Build user lookup
const userMap = {};
for (const u of data.users) {
  userMap[u._id] = u.name;
}

// Build message groups by conversation
const msgsByConv = {};
for (const m of data.messages) {
  if (!msgsByConv[m.conversationId]) msgsByConv[m.conversationId] = [];
  msgsByConv[m.conversationId].push(m);
}

console.green(`Found ${data.conversations.length} conversations and ${data.messages.length} messages.`);

// Output: Console
if (format === 'console') {
  // Summary table
  const summaryData = data.conversations.map((c) => ({
    Title: (c.title || '(untitled)').substring(0, 40),
    User: userMap[c.user] || c.user,
    Model: c.model || 'N/A',
    Endpoint: c.endpoint || 'N/A',
    Messages: (msgsByConv[c.conversationId] || []).length,
    Updated: new Date(c.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
  }));
  console.log('');
  console.purple('=== Conversations ===');
  console.table(summaryData);

  // Message timeline
  console.purple('=== Messages ===');
  for (const msg of data.messages) {
    const time = new Date(msg.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
    });
    const preview = (msg.text || '(no text)').substring(0, 120).replace(/\n/g, ' ');
    const isUser = msg.sender === 'User';
    const color = isUser ? 'blue' : 'green';
    const senderName = isUser
      ? userMap[data.conversations.find((c) => c.conversationId === msg.conversationId)?.user] || 'User'
      : msg.sender || 'AI';
    console[color](`[${time}] ${senderName}: ${preview}`);
  }

  process.exit(0);
}

// Output: JSON
if (format === 'json') {
  const enriched = {
    date: dateLabel,
    summary: {
      totalConversations: data.conversations.length,
      totalMessages: data.messages.length,
      userMessages: data.messages.filter((m) => m.sender === 'User').length,
      aiMessages: data.messages.filter((m) => m.sender !== 'User').length,
      activeUsers: [...new Set(data.conversations.map((c) => userMap[c.user] || c.user))],
      modelsUsed: [...new Set(data.messages.filter((m) => m.model).map((m) => m.model))],
    },
    conversations: data.conversations.map((c) => ({
      ...c,
      userName: userMap[c.user] || c.user,
      messages: (msgsByConv[c.conversationId] || []).map((m) => ({
        time: m.createdAt,
        sender: m.sender,
        model: m.model,
        text: m.text,
      })),
    })),
  };

  const outPath = outputArg || path.join(projectDir, `activity-report-${dateLabel}.json`);
  fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2), 'utf-8');
  console.green(`JSON report saved to: ${outPath}`);
  process.exit(0);
}

// Output: DOCX
if (format === 'docx') {
  let docx;
  try {
    docx = require('docx');
  } catch {
    console.red('The "docx" package is not installed. Run: npm install --save-dev docx');
    process.exit(1);
  }

  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    HeadingLevel,
    BorderStyle,
  } = docx;

  const children = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: 'LibreChat Activity Report', bold: true, size: 48 })],
    }),
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Date: ${dateLabel}`, size: 24, color: '666666' })],
    }),
  );
  children.push(new Paragraph({ children: [] }));

  // Summary
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Summary', bold: true })],
    }),
  );

  const totalUserMsgs = data.messages.filter((m) => m.sender === 'User').length;
  const totalAiMsgs = data.messages.filter((m) => m.sender !== 'User').length;
  const uniqueUsers = [...new Set(data.conversations.map((c) => c.user))];
  const models = [...new Set(data.messages.filter((m) => m.model).map((m) => m.model))];

  const summaryRows = [
    ['Total Conversations', String(data.conversations.length)],
    ['Total Messages', String(data.messages.length)],
    ['User Messages', String(totalUserMsgs)],
    ['AI Responses', String(totalAiMsgs)],
    ['Active Users', uniqueUsers.map((u) => userMap[u] || u).join(', ')],
    ['Models Used', models.join(', ')],
  ];

  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: summaryRows.map(
        ([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: label, bold: true, size: 22 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                borders,
                children: [new Paragraph({ children: [new TextRun({ text: value, size: 22 })] })],
              }),
            ],
          }),
      ),
    }),
  );

  children.push(new Paragraph({ children: [] }));

  // Conversations
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Conversations', bold: true })],
    }),
  );

  const convOrder = data.conversations.sort(
    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
  );

  for (const conv of convOrder) {
    const msgs = msgsByConv[conv.conversationId] || [];
    const userName = userMap[conv.user] || conv.user;

    children.push(new Paragraph({ children: [] }));
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: conv.title || '(Untitled)', bold: true })],
      }),
    );

    const firstTime = msgs[0]
      ? new Date(msgs[0].createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      })
      : 'N/A';
    const lastTime = msgs[msgs.length - 1]
      ? new Date(msgs[msgs.length - 1].createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      })
      : 'N/A';

    const metaLines = [
      `User: ${userName}`,
      `Model: ${conv.model || 'N/A'} (${conv.endpoint || 'N/A'})`,
      `Messages: ${msgs.length}`,
      `Time: ${firstTime} - ${lastTime} UTC`,
    ];

    for (const line of metaLines) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 20, color: '888888', italics: true })],
        }),
      );
    }

    children.push(new Paragraph({ children: [] }));

    for (const msg of msgs) {
      const isUser = msg.sender === 'User';
      const senderLabel = isUser ? userName : msg.sender || 'AI';
      const time = new Date(msg.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
      });
      const text = msg.text || '(no text captured)';

      children.push(
        new Paragraph({
          spacing: { before: 120 },
          children: [
            new TextRun({ text: `[${time}] `, size: 18, color: '999999' }),
            new TextRun({
              text: `${senderLabel}: `,
              bold: true,
              size: 22,
              color: isUser ? '1a56db' : '2e7d32',
            }),
          ],
        }),
      );

      const textLines = text.split('\n');
      for (const line of textLines) {
        children.push(
          new Paragraph({
            indent: { left: 360 },
            children: [new TextRun({ text: line || ' ', size: 22 })],
          }),
        );
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });

  Packer.toBuffer(doc).then((buffer) => {
    const outPath = outputArg || path.join(projectDir, `activity-report-${dateLabel}.docx`);
    fs.writeFileSync(outPath, buffer);
    console.green(`DOCX report saved to: ${outPath}`);
    process.exit(0);
  });
  return;
}

console.red(`Unknown format: ${format}. Use: console, json, or docx`);
process.exit(1);
