/**
 * 轻量 SEO 工具：按路由更新 document.title / meta description / OG 标签。
 * HashRouter 下整站为单一 URL，动态 meta 主要服务于分享与站内导航语境。
 */

export interface PageMeta {
  title: string;
  description?: string;
  image?: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setPageMeta({ title, description, image }: PageMeta) {
  document.title = title;
  const baseUrl = document.baseURI;
  upsertMeta('name', 'description', description ?? title);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:url', baseUrl);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  if (description) {
    upsertMeta('property', 'og:description', description);
    upsertMeta('name', 'twitter:description', description);
  }
  const img = image ?? `${import.meta.env.BASE_URL}og-image.jpg`;
  upsertMeta('property', 'og:image', img);
  upsertMeta('name', 'twitter:image', img);
}
