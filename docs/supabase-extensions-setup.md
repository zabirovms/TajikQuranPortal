# Setting Up Supabase Extensions for Better Tajik Search

This document explains how to enable and configure Supabase extensions to improve search functionality for Tajik language content in the Quran application.

## Pre-requisites

- Access to your Supabase project with admin privileges
- SQL query access through the Supabase dashboard

## Required Extensions

1. **unaccent** - For accent-insensitive search
2. **pg_trgm** - For trigram-based similarity search
3. **pgroonga** (if available) - For full-text search with non-Latin languages support

## Setup Instructions

### 1. Connect to your Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com/) and log in
2. Select your project
3. Navigate to the "SQL Editor" section

### 2. Execute the SQL Extension Setup

Copy and paste the content from the `scripts/setup-search-extensions.sql` file into the SQL editor and run it.

If you don't have superuser permissions, you might need to contact Supabase support to enable these extensions for your project.

### 3. Test the Extensions

After enabling the extensions, you can test them with the following query:

```sql
-- Test the similarity search with a Tajik word
SELECT id, unique_key, tajik_text, similarity(tajik_text, 'номи') as sim_score
FROM verses
WHERE similarity(tajik_text, 'номи') > 0.3
ORDER BY sim_score DESC
LIMIT 10;
```

### 4. Updating the Application

Once the extensions are set up, the application will automatically use them through the `search_verses` SQL function whenever a search is performed.

## Troubleshooting

- If you encounter permissions errors when creating extensions, contact Supabase support
- For large databases, creating the GIN indexes might take some time
- The similarity threshold (0.3) can be adjusted if search results are too broad or too narrow

## Advanced Configuration

For more advanced search capabilities, consider:

1. **Creating a Custom Search Vector**: Combine multiple fields for more comprehensive search
2. **Language-Specific Configuration**: Configure full-text search for Tajik/Persian language specifics
3. **Stemming**: Add support for stemming to find variations of words

Contact your database administrator for implementing these advanced features.