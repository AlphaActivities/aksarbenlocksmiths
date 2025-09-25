@@ .. @@
-import type { BlogPost } from "./types";
+import type { BlogPost } from "../../src/data/posts/types";

 // 1) Copy a post object from /src/data/blogPosts.ts
 // 2) Paste it here as `const post: BlogPost = { ... }` with no field changes
 // 3) Export default post
-// 4) Save as /src/data/posts/<slug>.ts
+// 4) Save as /src/data/posts/<slug>.ts (filename must match slug exactly)

 const post: BlogPost = {
 }