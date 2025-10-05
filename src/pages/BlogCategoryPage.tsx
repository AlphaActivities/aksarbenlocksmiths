import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { posts as BLOG_POSTS } from '../data/posts';
import { BLOG_CATEGORIES, isValidCategory } from '../data/blogCategories';
import { Phone, ArrowLeft } from 'lucide-react';
import { trackClick } from '../utils/analytics';

export default function BlogCategoryPage() {
  const { category = '' } = useParams();
  const [params] = useSearchParams();
  const PER_PAGE = 10;
  
  if (!isValidCategory(category)) {
    return (
      <>
        <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
          <span className="text-white animate-pulse">24/7 Emergency Service</span>
          <a
            href="tel:+14025566715"
            onClick={(e) =>
              trackClick("top_bar_phone_click", e.currentTarget, {
                phone_number: "+14025566715",
                source: "top_emergency_bar",
                page_section: "emergency_top_bar",
              })
            }
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition animate-pulse"
          >
            <Phone className="h-4 w-4" />
            (402) 556-6715
          </a>
        </div>

        <div className="min-h-screen w-full relative">
          <main className="min-h-screen w-full relative overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              poster="/images/Services Thumbnails/Residential-Service-Photo.webp"
              className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
              src="/videos/wallpaper.mp4"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="animated-footer-bg" />
              <div className="footer-glass-effect absolute inset-0" />
            </div>
            <div className="absolute inset-0 z-[3] pointer-events-none bg-black/25 md:bg-black/10"></div>

            <div className="relative z-10 text-white pt-12 md:pt-16">
              <main className="container mx-auto px-6 py-16">
                <h1 className="text-3xl font-bold mb-4 text-white">Category not found</h1>
                <div className="flex gap-3">
                  <Link
                    to="/"
                    aria-label="Back to Home"
                    onClick={(e) =>
                      trackClick("not_found_back_home_click", e.currentTarget, {
                        source_page: "blog_category_404",
                        page_section: "not_found",
                      })
                    }
                    className="inline-flex items-center rounded-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    Back to Home
                  </Link>
                  
                  <Link 
                    className="inline-flex items-center rounded-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors" 
                    to="/blog"
                    onClick={(e) => trackClick('category_not_found_back_to_blog', e.currentTarget, {
                      source_page: 'blog_category_404',
                      page_section: 'not_found'
                    })}
                  >
                    Go back to the blog
                  </Link>
                </div>
              </main>
            </div>
          </main>
        </div>
      </>
    );
  }

  const meta = BLOG_CATEGORIES[category];
  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const baseCanonical = `https://aksarbenlocksmiths.com/blog/${category}`;
  const canonical = page > 1 ? `${baseCanonical}?page=${page}` : baseCanonical;
  
  const all = BLOG_POSTS.filter((p) => p.category === category);
  const sorted = all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const total = all.length;
  const start = (page - 1) * PER_PAGE;
  const end = Math.min(start + PER_PAGE, total);
  const paged = sorted.slice(start, end);

  // CollectionPage + ItemList JSON-LD for currently visible posts
  const items = paged.map((p, idx) => ({
    "@type": "ListItem",
    "position": idx + 1,
    "url": `https://aksarbenlocksmiths.com/blog/${p.slug}`,
    "name": p.title
  }));
  
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Aksarben Locksmiths Blog – ${meta.h1}`,
    "url": `https://aksarbenlocksmiths.com/blog/${category}`,
    "isPartOf": "https://aksarbenlocksmiths.com/blog",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": items
    }
  };

  // Breadcrumbs JSON-LD
  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aksarbenlocksmiths.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://aksarbenlocksmiths.com/blog' },
      { '@type': 'ListItem', position: 3, name: meta.h1, item: canonical },
    ],
  };

  return (
    <>
      <div className="fixed top-0 w-full z-50 bg-black backdrop-blur-md shadow-lg text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-white motion-safe:animate-pulse">24/7 Emergency Service</span>
        <a
          href="tel:+14025566715"
          onClick={(e) =>
            trackClick("top_bar_phone_click", e.currentTarget, {
              phone_number: "+14025566715",
              source: "top_emergency_bar",
              page_section: "emergency_top_bar",
            })
          }
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition motion-safe:animate-pulse"
        >
          <Phone className="h-4 w-4" />
          (402) 556-6715
        </a>
      </div>

      <div className="min-h-screen w-full relative">
        <main className="min-h-screen w-full relative overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            poster="/images/services-thumbnails/Residential-Service-Photo.webp"
            className="fixed inset-0 w-full h-full object-cover opacity-45 z-0"
            src="/videos/wallpaper.mp4"
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="animated-footer-bg" />
            <div className="footer-glass-effect absolute inset-0" />
          </div>
          <div className="absolute inset-0 z-[3] pointer-events-none bg-black/25 md:bg-black/10"></div>

          <div className="relative z-10 text-white pt-8 md:pt-10">
            <Helmet>
              <title>{meta.title}</title>
              <meta name="description" content={meta.seoDescription} />
              <link rel="canonical" href={canonical} />
              <meta name="robots" content="index, follow" />
              <meta property="og:type" content="website" />
              <meta property="og:title" content={meta.h1 + ' | Aksarben Locksmiths'} />
              <meta property="og:description" content={meta.seoDescription} />
              <meta property="og:url" content={canonical} />
              <meta property="og:image" content="https://aksarbenlocksmiths.com/images/shield-logo.webp" />
              <meta property="og:image:width" content="1080" />
              <meta property="og:image:height" content="1080" />
              <meta property="twitter:image" content="https://aksarbenlocksmiths.com/images/shield-logo.webp" />
              <meta name="twitter:image:width" content="1080" />
              <meta name="twitter:image:height" content="1080" />
              {page > 1 && <link rel="prev" href={`${baseCanonical}?page=${page - 1}`} />}
              {end < total && <link rel="next" href={`${baseCanonical}?page=${page + 1}`} />}
              <script type="application/ld+json">{JSON.stringify(breadcrumbsLd)}</script>
              <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
            </Helmet>

            <main className="container mx-auto px-6 py-12">
              <div className="mb-6">
                <Link 
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[linear-gradient(to_left,_#7f1d1d,_#991b1b,_#ef4444,_#b91c1c,_#991b1b,_#7f1d1d)] bg-[length:800%_100%] animate-[redHeatWave_3s_linear_infinite] text-white text-sm shadow-[0_0_24px_rgba(255,255,255,0.5)] hover:brightness-125 hover:scale-105 transition duration-300 ease-in-out" 
                  to="/blog"
                  onClick={(e) => trackClick('blog_category_back_to_blog', e.currentTarget, {
                    source_page: `blog_category_${category}`,
                    page_section: 'header',
                    category: category
                  })}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3">{meta.h1}</h1>
              <p className="text-base text-white/80 max-w-3xl mb-8">{meta.intro}</p>

              {paged.length === 0 ? (
                <p className="text-white/70">No articles yet in this category. Check back soon.</p>
              ) : (
                <ul className="space-y-4">
                  {paged.map((p) => (
                    <li key={p.slug} className="p-4 rounded-xl bg-black/70 ring-1 ring-white/10 hover:bg-black/80 transition-colors">
                      <Link 
                        className="text-xl font-semibold text-blue-400 hover:text-blue-300 underline" 
                        to={`/blog/${p.slug}`}
                        onClick={(e) => trackClick('blog_category_post_click', e.currentTarget, {
                          source_page: `blog_category_${category}`,
                          page_section: 'post_list',
                          post_slug: p.slug,
                          category: category
                        })}
                      >
                        {p.title}
                      </Link>
                      {p.excerpt && <p className="text-white/80 mt-1">{p.excerpt}</p>}
                      <div className="mt-2 text-sm text-white/50">
                        {p.city} · {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="mt-10 flex items-center justify-between">
                <div>
                  Page {page} of {Math.max(1, Math.ceil(total / PER_PAGE))}
                </div>
                <div className="flex gap-3">
                  {page > 1 && (
                    <a className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50" href={`?page=${page - 1}`} aria-label="Previous page">
                      Previous
                    </a>
                  )}
                  {end < total && (
                    <a className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50" href={`?page=${page + 1}`} aria-label="Next page">
                      Next
                    </a>
                  )}
                </div>
              </div>
            </main>
          </div>
        </main>
      </div>
    </>
  );
}