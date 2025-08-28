@@ .. @@
 import React from "react";
 import { Helmet } from "react-helmet-async";
-import { useNavigate } from "react-router-dom";
+import { useNavigate, useLocation } from "react-router-dom";
+import { useEffect } from "react";
 import { ArrowLeft } from "lucide-react";
 import { trackClick } from "../utils/analytics";
 
 export default function ServiceAreasPage() {
   const navigate = useNavigate();
+  const location = useLocation();
+
+  useEffect(() => {
+    if (location?.state?.openAtTop && !location?.state?.restorePosition) {
+      window.scrollTo({ top: 0, behavior: "instant" });
+    }
+  }, [location]);
 
   const mainAreas = [
@@ .. @@
         className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
         src="/videos/wallpaper.mp4"
       />
+      <div className="animated-footer-bg" />
+      <div className="footer-glass-effect" />
 
       {/* page shell, mirror DynamicServicePage tokens */}
-      <div className="relative z-10 min-h-screen bg-gradient-to-br backdrop-blur-sm px-6 py-12 pt-16">
+      <div className="relative z-10 min-h-screen px-6 py-12 pt-16">
         <button
@@ .. @@
         </p>
 
         {/* Main Areas */}
-        <div className="mb-12">
+        <section className="mb-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6">
           <h2 className="text-white text-2xl font-bold mb-4 text-center">Main Areas</h2>
-          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
+          <div className="flex flex-wrap gap-3 justify-center">
             {mainAreas.map(area => (
-              <a
+              <span
                 key={area}
-                id={area.toLowerCase().replace(/\s+/g, "-")}
-                href={"#"+area.toLowerCase().replace(/\s+/g, "-")}
-                className="block rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
+                className="rounded-full px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 hover:scale-105 transition-all text-sm font-medium"
               >
-                <span className="font-semibold">{area}</span>
-              </a>
+                {area}
+              </span>
             ))}
           </div>
-        </div>
+        </section>
 
         {/* Surrounding Communities */}
-        <div>
+        <section className="mb-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6">
           <h2 className="text-white text-2xl font-bold mb-4 text-center">Surrounding Communities</h2>
-          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
+          <div className="flex flex-wrap gap-3 justify-center">
             {otherAreas.map(area => (
-              <a
+              <span
                 key={area}
-                id={area.toLowerCase().replace(/\s+/g, "-")}
-                href={"#"+area.toLowerCase().replace(/\s+/g, "-")}
-                className="block rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
+                className="rounded-full px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 hover:scale-105 transition-all text-sm font-medium"
               >
-                <span className="font-semibold">{area}</span>
-              </a>
+                {area}
+              </span>
             ))}
           </div>
-        </div>
+        </section>
       </div>
     </div>
   );
 }