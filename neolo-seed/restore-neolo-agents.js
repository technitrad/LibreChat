// =============================================================================
// NEOLO capped agents -- seed + restore  (generated 2026-06-09 from librechat prod)
// =============================================================================
// These 3 agents (NEOLO Assistant / GPT-5.2 / Gemini) live ONLY in MongoDB.
// librechat.yaml references them by agent_id in modelSpecs -- if the DB is ever
// wiped or restored from an old backup, the specs point at dead agent_ids and the
// forced-agent setup breaks. This file makes them reproducible from git.
//
// Each: Sonnet 4.6 / GPT-5.2 / Gemini 3.5 Flash, maxContextTokens 256000, all 91
// neolo-mcp tools, public-viewer ACL (visible to all users), author David Fay.
//
// RESTORE (idempotent -- upserts by _id) inside the MongoDB container:
//   mongosh 'mongodb://mongo:<pw>@localhost:27017/test?authSource=admin' restore-neolo-agents.js
//
// RE-EXPORT after changing agent config in the DB so git stays source of truth.
// =============================================================================

const RAW = {
  "agents": [
    {
      "_id": {
        "$oid": "6a2381acb6b0b1aaa88ce5b0"
      },
      "id": "agent_N2AY02yFV92f15ZNCM1p6G",
      "name": "NEOLO Assistant",
      "description": "General NEOLO assistant for memoQ/Phrase projects, documents, termbases, TMs, QA, MQM, and terminology. Context-capped (64k) for cost control.",
      "instructions": "You are NEOLO's assistant for translation production across memoQ and Phrase: projects, documents, termbases, translation memories, QA, MQM reports, review feedback, and terminology research.\n\nEfficiency rules (important):\n- When you start a background job with start_job, do NOT poll get_job_status in a tight loop. Poll at most once every ~2 minutes, and if a poll says 'too early', wait the full retry_after_seconds before checking again. Prefer telling the user you'll report back over rapid re-polling.\n- Reuse project, document, termbase, and TM data already retrieved earlier in this conversation instead of re-fetching it.\n- Be concise; present results in compact tables.\n- After your initial context-gathering for a project, restate the key facts (language pair, termbase names/IDs, TM names, project id) in your reply and rely on that summary for the rest of the conversation. Do NOT re-run the project / termbase / TM lookups again in the same chat unless the user switches to a different project.",
      "provider": "anthropic",
      "model": "claude-sonnet-4-6",
      "model_parameters": {
        "temperature": 0.3,
        "maxContextTokens": 256000,
        "thinking": false
      },
      "artifacts": "default",
      "tools": [
        "sys__server__sys_mcp_neolo-mcp",
        "list_projects_mcp_neolo-mcp",
        "get_project_by_name_mcp_neolo-mcp",
        "get_project_mcp_neolo-mcp",
        "get_project_statistics_mcp_neolo-mcp",
        "get_project_word_count_mcp_neolo-mcp",
        "list_templates_mcp_neolo-mcp",
        "create_project_from_template_mcp_neolo-mcp",
        "list_documents_mcp_neolo-mcp",
        "get_document_mcp_neolo-mcp",
        "export_document_mcp_neolo-mcp",
        "reimport_document_mcp_neolo-mcp",
        "export_project_documents_mcp_neolo-mcp",
        "get_document_statistics_mcp_neolo-mcp",
        "reimport_documents_batch_mcp_neolo-mcp",
        "list_termbases_mcp_neolo-mcp",
        "search_termbase_mcp_neolo-mcp",
        "get_termbase_mcp_neolo-mcp",
        "export_termbase_mcp_neolo-mcp",
        "get_termbase_entries_mcp_neolo-mcp",
        "import_termbase_mcp_neolo-mcp",
        "list_translation_memories_mcp_neolo-mcp",
        "search_translation_memory_mcp_neolo-mcp",
        "get_project_tms_mcp_neolo-mcp",
        "concordance_search_mcp_neolo-mcp",
        "get_translation_memory_mcp_neolo-mcp",
        "lookup_tm_exact_mcp_neolo-mcp",
        "lookup_tm_fuzzy_mcp_neolo-mcp",
        "import_tmx_mcp_neolo-mcp",
        "export_tmx_mcp_neolo-mcp",
        "get_user_mcp_neolo-mcp",
        "assign_users_to_project_mcp_neolo-mcp",
        "load_document_mcp_neolo-mcp",
        "get_segment_with_context_mcp_neolo-mcp",
        "search_segments_mcp_neolo-mcp",
        "get_document_summary_mcp_neolo-mcp",
        "unload_document_mcp_neolo-mcp",
        "run_project_qa_mcp_neolo-mcp",
        "pretranslate_project_mcp_neolo-mcp",
        "run_project_analysis_mcp_neolo-mcp",
        "get_project_workflow_status_mcp_neolo-mcp",
        "deliver_project_mcp_neolo-mcp",
        "get_project_users_mcp_neolo-mcp",
        "clone_project_mcp_neolo-mcp",
        "archive_project_mcp_neolo-mcp",
        "import_document_mcp_neolo-mcp",
        "create_tm_mcp_neolo-mcp",
        "add_translation_unit_mcp_neolo-mcp",
        "update_tm_entry_mcp_neolo-mcp",
        "get_tm_statistics_mcp_neolo-mcp",
        "generate_mqm_report_from_provided_text_mcp_neolo-mcp",
        "generate_mqm_report_from_project_mcp_neolo-mcp",
        "generate_mqm_report_from_segments_mcp_neolo-mcp",
        "apply_mqm_corrections_mcp_neolo-mcp",
        "auto_refine_mqm_until_target_mcp_neolo-mcp",
        "start_job_mcp_neolo-mcp",
        "get_job_status_mcp_neolo-mcp",
        "get_job_result_mcp_neolo-mcp",
        "generate_review_feedback_from_project_mcp_neolo-mcp",
        "generate_review_feedback_from_segments_mcp_neolo-mcp",
        "get_translation_suggestions_mcp_neolo-mcp",
        "get_segment_feedback_mcp_neolo-mcp",
        "research_segment_mcp_neolo-mcp",
        "termbase_lookup_direct_mcp_neolo-mcp",
        "search_project_termbases_mcp_neolo-mcp",
        "concordance_search_direct_mcp_neolo-mcp",
        "get_project_termbases_direct_mcp_neolo-mcp",
        "compare_segment_versions_mcp_neolo-mcp",
        "extract_terms_from_document_mcp_neolo-mcp",
        "extract_bilingual_terms_mcp_neolo-mcp",
        "batch_segment_feedback_mcp_neolo-mcp",
        "batch_translation_suggestions_mcp_neolo-mcp",
        "get_terminology_consensus_mcp_neolo-mcp",
        "list_workflow_checkpoints_mcp_neolo-mcp",
        "get_checkpoint_details_mcp_neolo-mcp",
        "resume_from_checkpoint_mcp_neolo-mcp",
        "search_across_projects_mcp_neolo-mcp",
        "search_canadian_government_sites_mcp_neolo-mcp",
        "search_external_terminology_databases_mcp_neolo-mcp",
        "search_tms_termbases_mcp_neolo-mcp",
        "research_term_with_ai_mcp_neolo-mcp",
        "validate_term_attestation_mcp_neolo-mcp",
        "clarifie_terminology_research_mcp_neolo-mcp",
        "extract_curated_terms_mcp_neolo-mcp",
        "load_validated_terms_mcp_neolo-mcp",
        "analyze_quality_mcp_neolo-mcp",
        "auto_fix_issues_mcp_neolo-mcp",
        "estimate_cost_mcp_neolo-mcp",
        "confirm_terms_mcp_neolo-mcp",
        "save_results_mcp_neolo-mcp",
        "load_assets_mcp_neolo-mcp",
        "generate_persona_mcp_neolo-mcp"
      ],
      "tool_kwargs": [],
      "agent_ids": [],
      "edges": [],
      "conversation_starters": [],
      "category": "general",
      "support_contact": {
        "name": "",
        "email": ""
      },
      "author": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "projectIds": [],
      "is_promoted": false,
      "mcpServerNames": [
        "neolo-mcp"
      ],
      "createdAt": {
        "$date": "2026-06-06T02:10:52.009Z"
      },
      "updatedAt": {
        "$date": "2026-06-06T15:38:31.255Z"
      },
      "__v": 0
    },
    {
      "_id": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b0"
      },
      "id": "agent_pf3h5Hg6KPxpJSbajgeHJ0",
      "name": "NEOLO Assistant (GPT-5.2)",
      "description": "GPT-5.2 with all 91 NEOLO MCP tools. Context-capped (64k) for cost control.",
      "instructions": "You are NEOLO's assistant for translation production across memoQ and Phrase: projects, documents, termbases, translation memories, QA, MQM reports, review feedback, and terminology research.\n\nEfficiency rules (important):\n- When you start a background job with start_job, do NOT poll get_job_status in a tight loop. Poll at most once every ~2 minutes, and if a poll says 'too early', wait the full retry_after_seconds before checking again. Prefer telling the user you'll report back over rapid re-polling.\n- Reuse project, document, termbase, and TM data already retrieved earlier in this conversation instead of re-fetching it.\n- Be concise; present results in compact tables.\n- After your initial context-gathering for a project, restate the key facts (language pair, termbase names/IDs, TM names, project id) in your reply and rely on that summary for the rest of the conversation. Do NOT re-run the project / termbase / TM lookups again in the same chat unless the user switches to a different project.",
      "provider": "openAI",
      "model": "gpt-5.2-2025-12-11",
      "model_parameters": {
        "maxContextTokens": 256000
      },
      "artifacts": "default",
      "tools": [
        "sys__server__sys_mcp_neolo-mcp",
        "list_projects_mcp_neolo-mcp",
        "get_project_by_name_mcp_neolo-mcp",
        "get_project_mcp_neolo-mcp",
        "get_project_statistics_mcp_neolo-mcp",
        "get_project_word_count_mcp_neolo-mcp",
        "list_templates_mcp_neolo-mcp",
        "create_project_from_template_mcp_neolo-mcp",
        "list_documents_mcp_neolo-mcp",
        "get_document_mcp_neolo-mcp",
        "export_document_mcp_neolo-mcp",
        "reimport_document_mcp_neolo-mcp",
        "export_project_documents_mcp_neolo-mcp",
        "get_document_statistics_mcp_neolo-mcp",
        "reimport_documents_batch_mcp_neolo-mcp",
        "list_termbases_mcp_neolo-mcp",
        "search_termbase_mcp_neolo-mcp",
        "get_termbase_mcp_neolo-mcp",
        "export_termbase_mcp_neolo-mcp",
        "get_termbase_entries_mcp_neolo-mcp",
        "import_termbase_mcp_neolo-mcp",
        "list_translation_memories_mcp_neolo-mcp",
        "search_translation_memory_mcp_neolo-mcp",
        "get_project_tms_mcp_neolo-mcp",
        "concordance_search_mcp_neolo-mcp",
        "get_translation_memory_mcp_neolo-mcp",
        "lookup_tm_exact_mcp_neolo-mcp",
        "lookup_tm_fuzzy_mcp_neolo-mcp",
        "import_tmx_mcp_neolo-mcp",
        "export_tmx_mcp_neolo-mcp",
        "get_user_mcp_neolo-mcp",
        "assign_users_to_project_mcp_neolo-mcp",
        "load_document_mcp_neolo-mcp",
        "get_segment_with_context_mcp_neolo-mcp",
        "search_segments_mcp_neolo-mcp",
        "get_document_summary_mcp_neolo-mcp",
        "unload_document_mcp_neolo-mcp",
        "run_project_qa_mcp_neolo-mcp",
        "pretranslate_project_mcp_neolo-mcp",
        "run_project_analysis_mcp_neolo-mcp",
        "get_project_workflow_status_mcp_neolo-mcp",
        "deliver_project_mcp_neolo-mcp",
        "get_project_users_mcp_neolo-mcp",
        "clone_project_mcp_neolo-mcp",
        "archive_project_mcp_neolo-mcp",
        "import_document_mcp_neolo-mcp",
        "create_tm_mcp_neolo-mcp",
        "add_translation_unit_mcp_neolo-mcp",
        "update_tm_entry_mcp_neolo-mcp",
        "get_tm_statistics_mcp_neolo-mcp",
        "generate_mqm_report_from_provided_text_mcp_neolo-mcp",
        "generate_mqm_report_from_project_mcp_neolo-mcp",
        "generate_mqm_report_from_segments_mcp_neolo-mcp",
        "apply_mqm_corrections_mcp_neolo-mcp",
        "auto_refine_mqm_until_target_mcp_neolo-mcp",
        "start_job_mcp_neolo-mcp",
        "get_job_status_mcp_neolo-mcp",
        "get_job_result_mcp_neolo-mcp",
        "generate_review_feedback_from_project_mcp_neolo-mcp",
        "generate_review_feedback_from_segments_mcp_neolo-mcp",
        "get_translation_suggestions_mcp_neolo-mcp",
        "get_segment_feedback_mcp_neolo-mcp",
        "research_segment_mcp_neolo-mcp",
        "termbase_lookup_direct_mcp_neolo-mcp",
        "search_project_termbases_mcp_neolo-mcp",
        "concordance_search_direct_mcp_neolo-mcp",
        "get_project_termbases_direct_mcp_neolo-mcp",
        "compare_segment_versions_mcp_neolo-mcp",
        "extract_terms_from_document_mcp_neolo-mcp",
        "extract_bilingual_terms_mcp_neolo-mcp",
        "batch_segment_feedback_mcp_neolo-mcp",
        "batch_translation_suggestions_mcp_neolo-mcp",
        "get_terminology_consensus_mcp_neolo-mcp",
        "list_workflow_checkpoints_mcp_neolo-mcp",
        "get_checkpoint_details_mcp_neolo-mcp",
        "resume_from_checkpoint_mcp_neolo-mcp",
        "search_across_projects_mcp_neolo-mcp",
        "search_canadian_government_sites_mcp_neolo-mcp",
        "search_external_terminology_databases_mcp_neolo-mcp",
        "search_tms_termbases_mcp_neolo-mcp",
        "research_term_with_ai_mcp_neolo-mcp",
        "validate_term_attestation_mcp_neolo-mcp",
        "clarifie_terminology_research_mcp_neolo-mcp",
        "extract_curated_terms_mcp_neolo-mcp",
        "load_validated_terms_mcp_neolo-mcp",
        "analyze_quality_mcp_neolo-mcp",
        "auto_fix_issues_mcp_neolo-mcp",
        "estimate_cost_mcp_neolo-mcp",
        "confirm_terms_mcp_neolo-mcp",
        "save_results_mcp_neolo-mcp",
        "load_assets_mcp_neolo-mcp",
        "generate_persona_mcp_neolo-mcp"
      ],
      "tool_kwargs": [],
      "agent_ids": [],
      "edges": [],
      "conversation_starters": [],
      "category": "general",
      "support_contact": {
        "name": "",
        "email": ""
      },
      "author": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "projectIds": [],
      "is_promoted": false,
      "mcpServerNames": [
        "neolo-mcp"
      ],
      "createdAt": {
        "$date": "2026-06-08T15:15:26.167Z"
      },
      "updatedAt": {
        "$date": "2026-06-08T15:15:26.167Z"
      },
      "__v": 0
    },
    {
      "_id": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b3"
      },
      "id": "agent_FLiwwIMe7Y1zXVmce9Ruu6",
      "name": "NEOLO Assistant (Gemini)",
      "description": "Gemini 3.5 Flash with all 91 NEOLO MCP tools. Context-capped (64k) for cost control.",
      "instructions": "You are NEOLO's assistant for translation production across memoQ and Phrase: projects, documents, termbases, translation memories, QA, MQM reports, review feedback, and terminology research.\n\nEfficiency rules (important):\n- When you start a background job with start_job, do NOT poll get_job_status in a tight loop. Poll at most once every ~2 minutes, and if a poll says 'too early', wait the full retry_after_seconds before checking again. Prefer telling the user you'll report back over rapid re-polling.\n- Reuse project, document, termbase, and TM data already retrieved earlier in this conversation instead of re-fetching it.\n- Be concise; present results in compact tables.\n- After your initial context-gathering for a project, restate the key facts (language pair, termbase names/IDs, TM names, project id) in your reply and rely on that summary for the rest of the conversation. Do NOT re-run the project / termbase / TM lookups again in the same chat unless the user switches to a different project.",
      "provider": "google",
      "model": "gemini-3.5-flash",
      "model_parameters": {
        "temperature": 0.3,
        "maxContextTokens": 256000
      },
      "artifacts": "default",
      "tools": [
        "sys__server__sys_mcp_neolo-mcp",
        "list_projects_mcp_neolo-mcp",
        "get_project_by_name_mcp_neolo-mcp",
        "get_project_mcp_neolo-mcp",
        "get_project_statistics_mcp_neolo-mcp",
        "get_project_word_count_mcp_neolo-mcp",
        "list_templates_mcp_neolo-mcp",
        "create_project_from_template_mcp_neolo-mcp",
        "list_documents_mcp_neolo-mcp",
        "get_document_mcp_neolo-mcp",
        "export_document_mcp_neolo-mcp",
        "reimport_document_mcp_neolo-mcp",
        "export_project_documents_mcp_neolo-mcp",
        "get_document_statistics_mcp_neolo-mcp",
        "reimport_documents_batch_mcp_neolo-mcp",
        "list_termbases_mcp_neolo-mcp",
        "search_termbase_mcp_neolo-mcp",
        "get_termbase_mcp_neolo-mcp",
        "export_termbase_mcp_neolo-mcp",
        "get_termbase_entries_mcp_neolo-mcp",
        "import_termbase_mcp_neolo-mcp",
        "list_translation_memories_mcp_neolo-mcp",
        "search_translation_memory_mcp_neolo-mcp",
        "get_project_tms_mcp_neolo-mcp",
        "concordance_search_mcp_neolo-mcp",
        "get_translation_memory_mcp_neolo-mcp",
        "lookup_tm_exact_mcp_neolo-mcp",
        "lookup_tm_fuzzy_mcp_neolo-mcp",
        "import_tmx_mcp_neolo-mcp",
        "export_tmx_mcp_neolo-mcp",
        "get_user_mcp_neolo-mcp",
        "assign_users_to_project_mcp_neolo-mcp",
        "load_document_mcp_neolo-mcp",
        "get_segment_with_context_mcp_neolo-mcp",
        "search_segments_mcp_neolo-mcp",
        "get_document_summary_mcp_neolo-mcp",
        "unload_document_mcp_neolo-mcp",
        "run_project_qa_mcp_neolo-mcp",
        "pretranslate_project_mcp_neolo-mcp",
        "run_project_analysis_mcp_neolo-mcp",
        "get_project_workflow_status_mcp_neolo-mcp",
        "deliver_project_mcp_neolo-mcp",
        "get_project_users_mcp_neolo-mcp",
        "clone_project_mcp_neolo-mcp",
        "archive_project_mcp_neolo-mcp",
        "import_document_mcp_neolo-mcp",
        "create_tm_mcp_neolo-mcp",
        "add_translation_unit_mcp_neolo-mcp",
        "update_tm_entry_mcp_neolo-mcp",
        "get_tm_statistics_mcp_neolo-mcp",
        "generate_mqm_report_from_provided_text_mcp_neolo-mcp",
        "generate_mqm_report_from_project_mcp_neolo-mcp",
        "generate_mqm_report_from_segments_mcp_neolo-mcp",
        "apply_mqm_corrections_mcp_neolo-mcp",
        "auto_refine_mqm_until_target_mcp_neolo-mcp",
        "start_job_mcp_neolo-mcp",
        "get_job_status_mcp_neolo-mcp",
        "get_job_result_mcp_neolo-mcp",
        "generate_review_feedback_from_project_mcp_neolo-mcp",
        "generate_review_feedback_from_segments_mcp_neolo-mcp",
        "get_translation_suggestions_mcp_neolo-mcp",
        "get_segment_feedback_mcp_neolo-mcp",
        "research_segment_mcp_neolo-mcp",
        "termbase_lookup_direct_mcp_neolo-mcp",
        "search_project_termbases_mcp_neolo-mcp",
        "concordance_search_direct_mcp_neolo-mcp",
        "get_project_termbases_direct_mcp_neolo-mcp",
        "compare_segment_versions_mcp_neolo-mcp",
        "extract_terms_from_document_mcp_neolo-mcp",
        "extract_bilingual_terms_mcp_neolo-mcp",
        "batch_segment_feedback_mcp_neolo-mcp",
        "batch_translation_suggestions_mcp_neolo-mcp",
        "get_terminology_consensus_mcp_neolo-mcp",
        "list_workflow_checkpoints_mcp_neolo-mcp",
        "get_checkpoint_details_mcp_neolo-mcp",
        "resume_from_checkpoint_mcp_neolo-mcp",
        "search_across_projects_mcp_neolo-mcp",
        "search_canadian_government_sites_mcp_neolo-mcp",
        "search_external_terminology_databases_mcp_neolo-mcp",
        "search_tms_termbases_mcp_neolo-mcp",
        "research_term_with_ai_mcp_neolo-mcp",
        "validate_term_attestation_mcp_neolo-mcp",
        "clarifie_terminology_research_mcp_neolo-mcp",
        "extract_curated_terms_mcp_neolo-mcp",
        "load_validated_terms_mcp_neolo-mcp",
        "analyze_quality_mcp_neolo-mcp",
        "auto_fix_issues_mcp_neolo-mcp",
        "estimate_cost_mcp_neolo-mcp",
        "confirm_terms_mcp_neolo-mcp",
        "save_results_mcp_neolo-mcp",
        "load_assets_mcp_neolo-mcp",
        "generate_persona_mcp_neolo-mcp"
      ],
      "tool_kwargs": [],
      "agent_ids": [],
      "edges": [],
      "conversation_starters": [],
      "category": "general",
      "support_contact": {
        "name": "",
        "email": ""
      },
      "author": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "projectIds": [],
      "is_promoted": false,
      "mcpServerNames": [
        "neolo-mcp"
      ],
      "createdAt": {
        "$date": "2026-06-08T15:15:26.223Z"
      },
      "updatedAt": {
        "$date": "2026-06-08T15:15:26.223Z"
      },
      "__v": 0
    }
  ],
  "aclentries": [
    {
      "_id": {
        "$oid": "6a2381acb6b0b1aaa88ce5b1"
      },
      "principalType": "user",
      "principalModel": "User",
      "principalId": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "resourceType": "agent",
      "resourceId": {
        "$oid": "6a2381acb6b0b1aaa88ce5b0"
      },
      "permBits": 15,
      "roleId": {
        "$oid": "68a5d518c1980fd470444ee3"
      },
      "grantedBy": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "grantedAt": {
        "$date": "2026-06-06T02:10:52.009Z"
      },
      "createdAt": {
        "$date": "2026-06-06T02:10:52.009Z"
      },
      "updatedAt": {
        "$date": "2026-06-06T02:10:52.009Z"
      },
      "__v": 0
    },
    {
      "_id": {
        "$oid": "6a2381acb6b0b1aaa88ce5b2"
      },
      "principalType": "public",
      "resourceType": "agent",
      "resourceId": {
        "$oid": "6a2381acb6b0b1aaa88ce5b0"
      },
      "permBits": 1,
      "roleId": {
        "$oid": "68a5d518c1980fd470444ee1"
      },
      "grantedBy": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "grantedAt": {
        "$date": "2026-06-06T02:10:52.009Z"
      },
      "createdAt": {
        "$date": "2026-06-06T02:10:52.009Z"
      },
      "updatedAt": {
        "$date": "2026-06-06T02:10:52.009Z"
      },
      "__v": 0
    },
    {
      "_id": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b1"
      },
      "principalType": "user",
      "principalModel": "User",
      "principalId": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "resourceType": "agent",
      "resourceId": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b0"
      },
      "permBits": 15,
      "roleId": {
        "$oid": "68a5d518c1980fd470444ee3"
      },
      "grantedBy": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "grantedAt": {
        "$date": "2026-06-08T15:15:26.167Z"
      },
      "createdAt": {
        "$date": "2026-06-08T15:15:26.167Z"
      },
      "updatedAt": {
        "$date": "2026-06-08T15:15:26.167Z"
      },
      "__v": 0
    },
    {
      "_id": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b2"
      },
      "principalType": "public",
      "resourceType": "agent",
      "resourceId": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b0"
      },
      "permBits": 1,
      "roleId": {
        "$oid": "68a5d518c1980fd470444ee1"
      },
      "grantedBy": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "grantedAt": {
        "$date": "2026-06-08T15:15:26.167Z"
      },
      "createdAt": {
        "$date": "2026-06-08T15:15:26.167Z"
      },
      "updatedAt": {
        "$date": "2026-06-08T15:15:26.167Z"
      },
      "__v": 0
    },
    {
      "_id": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b4"
      },
      "principalType": "user",
      "principalModel": "User",
      "principalId": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "resourceType": "agent",
      "resourceId": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b3"
      },
      "permBits": 15,
      "roleId": {
        "$oid": "68a5d518c1980fd470444ee3"
      },
      "grantedBy": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "grantedAt": {
        "$date": "2026-06-08T15:15:26.223Z"
      },
      "createdAt": {
        "$date": "2026-06-08T15:15:26.223Z"
      },
      "updatedAt": {
        "$date": "2026-06-08T15:15:26.223Z"
      },
      "__v": 0
    },
    {
      "_id": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b5"
      },
      "principalType": "public",
      "resourceType": "agent",
      "resourceId": {
        "$oid": "6a26dc8e27dc9cc9d18ce5b3"
      },
      "permBits": 1,
      "roleId": {
        "$oid": "68a5d518c1980fd470444ee1"
      },
      "grantedBy": {
        "$oid": "6790024383d7f72c761eff68"
      },
      "grantedAt": {
        "$date": "2026-06-08T15:15:26.223Z"
      },
      "createdAt": {
        "$date": "2026-06-08T15:15:26.223Z"
      },
      "updatedAt": {
        "$date": "2026-06-08T15:15:26.223Z"
      },
      "__v": 0
    }
  ]
};

const SEED = EJSON.parse(JSON.stringify(RAW));
SEED.agents.forEach((a) => db.agents.replaceOne({ _id: a._id }, a, { upsert: true }));
SEED.aclentries.forEach((e) => db.aclentries.replaceOne({ _id: e._id }, e, { upsert: true }));
print("Restored " + SEED.agents.length + " agents + " + SEED.aclentries.length + " ACL entries:");
SEED.agents.forEach((a) =>
  print("  - " + a.id + "  " + a.name + "  (" + a.provider + ", maxCtx " +
        a.model_parameters.maxContextTokens + ", " + a.tools.length + " tool-entries)")
);
