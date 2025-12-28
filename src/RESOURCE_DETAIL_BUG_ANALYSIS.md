# 🐛 Resource Detail Page - Content Not Showing

## Problem
When clicking a resource from the Library page, the ResourceDetail page loads but doesn't show the actual content.

---

## Root Cause Analysis

### Issue #1: Data Structure Mismatch ❌

**What ResourceEditPage SAVES:**
```typescript
{
  id: "resource-123",
  title: "My Resource",
  category: "article",  // ← Simple string category
  description: "...",
  content: "<p>HTML from RichTextEditor</p>",  // ← HTML string
  author: "John Doe",
  thumbnail: "https://...",
  tags: ["mental health"],
  readTime: 5,  // ← Number
  published: true
}
```

**What ResourceDetail EXPECTS:**
```typescript
{
  id: "resource-123",
  title: "My Resource", 
  category: "Mental Health",  // ✅ OK
  contentType: "Article",  // ❌ MISSING - expects separate field
  description: "...",
  content: [  // ❌ EXPECTS ARRAY OF BLOCKS
    { type: 'paragraph', content: 'Text here' },
    { type: 'heading', content: 'Section Title' },
    { type: 'list', content: '', items: ['Item 1', 'Item 2'] }
  ],
  author: "John Doe",
  heroImage: "https://...",  // Uses different field name
  publishedDate: "2024-12-20",  // ← String date
  readTimeMinutes: 5,  // Different field name
  tags: ["mental health"],
  relatedResources: []  // ❌ MISSING
}
```

### Issue #2: API Response Unwrapping ❌

**Backend returns:**
```json
{
  "resource": { ...data... }
}
```

**api-client.ts getResource():**
```typescript
async getResource(id: string) {
  const result = await this.requestWithFallback(`/library/resources/${id}`, 'resources', {}, false, id);
  return result;  // ❌ Returns nested {resource: {...}}
}
```

**ResourceDetail expects:**
```typescript
const response = await apiClient.getResource(resourceId);
// Expects response to BE the resource object, not {resource: {...}}
```

### Issue #3: Content Rendering ❌

ResourceDetail has `renderContentBlocks()` function that expects:
```typescript
content: Array<{
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'tip';
  content: string;
  items?: string[];
}>
```

But ResourceEditPage saves:
```typescript
content: string  // HTML string from RichTextEditor
```

---

## Quick Fix Solutions

### Fix #1: Unwrap API Response

**File:** `/lib/api-client.ts`

```typescript
async getResource(id: string) {
  const result = await this.requestWithFallback(`/library/resources/${id}`, 'resources', {}, false, id);
  // Unwrap nested response
  return result.resource || result;
}
```

### Fix #2: Transform Data in ResourceDetail

**File:** `/components/screens/ResourceDetail.tsx`

Add a transformation function:

```typescript
const transformResourceData = (apiData: any): ResourceContent => {
  return {
    id: apiData.id,
    title: apiData.title,
    description: apiData.description,
    category: apiData.category || 'General',
    contentType: apiData.category || apiData.contentType || 'Article',
    readTimeMinutes: apiData.readTime || apiData.read_time_minutes || 5,
    author: apiData.author || 'iKan Team',
    publishedDate: apiData.created_at 
      ? new Date(apiData.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    
    // Convert HTML content string to blocks array
    content: parseContentToBlocks(apiData.content || ''),
    
    tags: apiData.tags || [],
    relatedResources: apiData.relatedResources || [],
    heroImage: apiData.thumbnail || apiData.heroImage,
    authorImage: apiData.authorImage
  };
};

const parseContentToBlocks = (htmlContent: string) => {
  if (!htmlContent) return [];
  
  // Simple HTML to blocks parser
  const blocks: any[] = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  tempDiv.childNodes.forEach((node: any) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const textContent = node.textContent || '';
      
      if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
        blocks.push({ type: 'heading', content: textContent });
      } else if (tagName === 'p') {
        blocks.push({ type: 'paragraph', content: textContent });
      } else if (tagName === 'ul' || tagName === 'ol') {
        const items = Array.from(node.querySelectorAll('li')).map((li: any) => li.textContent);
        blocks.push({ type: 'list', content: '', items });
      } else if (tagName === 'blockquote') {
        blocks.push({ type: 'quote', content: textContent });
      }
    }
  });
  
  // Fallback: if no blocks parsed, treat entire content as paragraph
  if (blocks.length === 0 && htmlContent) {
    blocks.push({ type: 'paragraph', content: htmlContent.replace(/<[^>]*>/g, '') });
  }
  
  return blocks;
};
```

### Fix #3: Add Fallback Mock for Development

When API returns incomplete data, show something instead of blank page:

```typescript
const response = await apiClient.getResource(resourceId);

if (!response) {
  throw new Error('Resource not found');
}

// Transform API data
let resourceData = transformResourceData(response);

// Add fallback content if empty
if (!resourceData.content || resourceData.content.length === 0) {
  resourceData.content = [
    { 
      type: 'paragraph', 
      content: resourceData.description || 'Content is being prepared for this resource.' 
    }
  ];
}

setResource(resourceData);
```

---

## Recommended Fix (Best Approach)

### Step 1: Fix API Unwrapping
Update `api-client.ts` line 639:
```typescript
return result.resource || result;
```

### Step 2: Add Data Transformer to ResourceDetail
Add the `transformResourceData` and `parseContentToBlocks` functions above.

### Step 3: Use Transformer in loadResource
```typescript
const response = await apiClient.getResource(resourceId);
const resourceData = transformResourceData(response);
setResource(resourceData);
```

---

## Alternative: Store Content as JSON in Backend

**Better long-term solution:**

Modify ResourceEditPage to save content as structured JSON:

```typescript
// When saving
const structuredContent = parseHtmlToBlocks(richTextEditorContent);
const resourceData = {
  ...formData,
  content_html: richTextEditorContent,  // Keep original
  content_structured: structuredContent  // Add structured version
};
```

Then ResourceDetail can use `content_structured` directly!

---

## Testing Steps

1. Create a resource with some content in the editor
2. Save and publish it
3. Go to Library page
4. Click on the resource
5. **Expected:** Content appears formatted correctly
6. **Check console** for transformation logs

---

## Files to Modify

1. ✅ `/lib/api-client.ts` - Unwrap API response
2. ✅ `/components/screens/ResourceDetail.tsx` - Add data transformer
3. (Optional) `/components/screens/ResourceEditPage.tsx` - Save structured content

---

**Priority:** HIGH  
**Impact:** Critical UX issue - users can't read resources  
**Estimated Fix Time:** 20 minutes
