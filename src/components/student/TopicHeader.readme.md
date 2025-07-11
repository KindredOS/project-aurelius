# 🧠 Science Markdown Personalization System — README

This document outlines how the student-specific markdown mirror system works across the frontend and backend for the Science module in the AiA platform.

---

## 📂 Folder Structure

### Public (Frontend Fallback Markdown)
```
/public/data/science/markdown/
  overview/
    what_is_science.md
    scientific_method.md
  module 1/
    atoms_and_matter.md
```

### User Mirror (Backend)
```
/data/Edu_AiA/student/{email}/science/
  markdown/
    overview/what_is_science.md
  user_index_science.json
```

---

## 🔁 Data Flow Overview

### On Concept Click
1. Frontend tries: `GET /api/edu/science/markdown?email=...&filepath=overview/what_is_science.md`
2. If 404, fetches public version (`/public/data/science/markdown/...`)
3. Saves fallback copy to backend via:
   `POST /api/edu/science/markdown/save`

---

## 🔄 AI Enhancement Flow

### On Header Enhance
1. `POST /api/enhanceMarkdown` with `{ text, action }`
2. Receives `data.result`
3. Saves back to mirror via:
   `POST /api/edu/science/markdown/save`

> ⚠️ Must ensure `data.result` is not double-encoded (no escaped newlines or extra quotes)

---

## 📊 User Progress Tracking

### File:
```
/data/Edu_AiA/student/{email}/science/user_index_science.json
```

### Format:
```json
{
  "overview": 60,
  "module1": 30,
  "module8": 40
}
```

### Routes:
- `GET /api/edu/science/user-index?email=...`
- `POST /api/edu/science/user-index/save` with:
  ```json
  {
    "email": "user@email.com",
    "progressData": { "overview": 55 }
  }
  ```

Progress is **merged** with existing data.

---

## ✅ Key Backend Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/edu/science/markdown` | `GET` | Returns personalized or fallback markdown |
| `/api/edu/science/markdown/save` | `POST` | Saves updated markdown (also creates backup) |
| `/api/edu/science/user-index` | `GET` | Loads user progress index JSON |
| `/api/edu/science/user-index/save` | `POST` | Merges and saves progress state |

---

## 🧪 Testing Tips
- Try deleting `user_index_science.json` to simulate a new user
- Log `data.result` in `TopicHeader.jsx` before saving to confirm format
- Test fallback by deleting user-specific `.md` file and clicking a concept

---

## 🚧 Future Considerations
- Add timestamps/versioning to markdown saves
- Add achievement milestones based on progress levels
- Allow viewing history of edits per header section
