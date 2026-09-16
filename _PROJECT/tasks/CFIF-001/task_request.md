We have a report rendering that is based on the similar data that we loaded in the following tables: "account_manager_summary, ""job_cost_change_orders", "rpt_new_jobs_opened"

Report rendering in HTML format: `_PROJECT/tasks/CFIF-001/inputs/CFI_Weekly_Sales_Report_Mockup.html`

**Note**: We are only concerned with the first page of the report, i.e., "Weekly Summary — New Jobs, Change Orders & Account Manager Sales". And the data that we see in there is old data and may differ from the data we loaded in the above tables using CSV extracts.

---

## Goal:

We want to create the same first page of the report in the web-application under reports. For now, since we only have limited data, we will not be allowing filters to work but put only the **date range** filter in the report page so that user can visualize how they will change the date range to pull respective report.

The report has 4 sections:

- 6 KPI cards on top
- New jobs opened - past week
- job cost change orders - last week (date range)
- account manager summary

The final report page should have the same.

The client is happy with the current report template so we should replicate the same.

Important Note: We will have more reports in the future.

### Acceptance criteria:

- Report generation is mapped to the tables data
- User can refresh the report page to see the report generated.
- Calculations, aggregations, etc all happen in Next JS application. No new tables are to be created for reporting.
- Users can click download button to download the report as PDF. No change to the layout, etc - should be exact same as the rendering on the web-page.
