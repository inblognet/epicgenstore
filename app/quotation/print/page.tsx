// app/quotation/print/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PrintQuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>
}) {
  const resolvedParams = await searchParams;
  if (!resolvedParams.items) return notFound();

  // 1. Fetch the selected products based on the IDs in the URL
  const itemIds = resolvedParams.items.split(',');
  const products = await prisma.product.findMany({
    where: { id: { in: itemIds } }
  });

  // 2. Fetch the dynamic settings you configured in the admin panel
  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });

  // 3. Calculate grand total
  const grandTotal = products.reduce((total, p) => total + Number(p.salePrice || p.price), 0);

  // Generate a deterministic quotation number based on the selected items
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const itemHash = resolvedParams.items.split('').reduce((acc, char) => (acc + char.charCodeAt(0)) % 10000, 0);
  const quoteNumber = `${dateStr}-W-${itemHash.toString().padStart(4, '0').toUpperCase()}`;

  const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

  return (
    // Web: Uses your active theme background and text colors.
    <div className="min-h-screen bg-surface-bg text-theme-main py-10 print:py-0 flex justify-center transition-colors duration-300">

      {/* Print Stylesheet */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 10mm; }

          /* THE MAGIC: We instantly overwrite your theme variables to "White Paper" mode for the printer! */
          /* We intentionally DO NOT overwrite --theme-primary, so your invoice header stays branded! */
          :root, html, body {
            --theme-bg: #ffffff !important;
            --theme-card: #ffffff !important;
            --theme-border: #e5e7eb !important; /* light gray */
            --theme-main: #111827 !important;   /* dark text */
            --theme-muted: #6b7280 !important;  /* gray text */
          }

          html, body, main, .min-h-screen {
            background: var(--theme-bg) !important;
            background-color: var(--theme-bg) !important;
          }

          .no-print { display: none !important; }

          /* Force colors to print exactly as seen on screen (for the brand header) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Remove borders and shadows from the paper in print mode */
          #print-section {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}} />

      {/* "Save as PDF" button fixed to bottom left */}
      <button
        id="print-btn"
        className="no-print fixed bottom-8 left-8 bg-brand hover:bg-brand-hover text-black font-black py-3 px-6 rounded-xl shadow-2xl transition-all z-50 flex items-center gap-2 shadow-brand/20 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Save as PDF
      </button>

      {/* SCRIPT: Waits 100ms to guarantee the Navbar is hidden before opening the print dialog */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('print-btn').onclick = function() {
          const mainContent = document.querySelector('main');

          if (mainContent && mainContent.parentElement) {
            Array.from(mainContent.parentElement.children).forEach(child => {
              if (child !== mainContent) {
                child.setAttribute('data-hidden-for-print', 'true');
                child.style.setProperty('display', 'none', 'important');
              }
            });
          }

          setTimeout(() => {
            window.print();

            setTimeout(() => {
              document.querySelectorAll('[data-hidden-for-print="true"]').forEach(el => {
                el.style.display = '';
                el.removeAttribute('data-hidden-for-print');
              });
            }, 500);
          }, 100);
        }
      `}} />

      {/* --- QUOTATION PAPER CONTAINER --- */}
      {/* Uses your theme card variables on web, but becomes pure white on print */}
      <div id="print-section" className="w-full max-w-[850px] bg-surface-card text-theme-main shadow-2xl p-8 md:p-12 border border-theme-border print:border-none print:shadow-none rounded-xl print:rounded-none transition-colors duration-300">

        {/* HEADER */}
        {/* bg-brand automatically uses your active theme's primary color! */}
        <div className="bg-brand rounded-xl p-8 flex items-start justify-between text-black mb-10 shadow-sm print:shadow-none transition-colors duration-300">
          <div className="w-48">
            {settings?.quotationLogoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={settings.quotationLogoUrl} alt="Logo" className="max-w-full h-auto object-contain" />
            ) : (
              <h2 className="text-3xl font-black italic tracking-widest leading-tight">{settings?.storeName || "EPIC STORE"}</h2>
            )}
          </div>

          <div className="text-right text-sm leading-relaxed font-medium">
            <p className="font-black text-lg mb-1 uppercase tracking-wider">{settings?.storeName || "EPIC STORE"}</p>
            {settings?.quotationAddress && <p>{settings.quotationAddress}</p>}
            {settings?.quotationPhone && <p>Hotline: {settings.quotationPhone}</p>}
            {settings?.quotationEmail && <p>Email: {settings.quotationEmail}</p>}
          </div>
        </div>

        {/* QUOTATION TITLE & DATE */}
        <div className="mb-8">
          <h1 className="text-center text-3xl font-black tracking-widest uppercase mb-6 text-theme-main">
            Quotation
          </h1>

          <div className="flex flex-col items-end text-sm text-theme-muted mb-4 font-medium">
            <p>Date: {today}</p>
            <p>Quotation No: {quoteNumber}</p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="overflow-hidden rounded-lg border border-theme-border mb-10 transition-colors duration-300">
          <table className="w-full text-left text-sm border-collapse bg-surface-card">
            <thead>
              <tr className="bg-surface-bg text-theme-muted uppercase tracking-wider text-xs border-b border-theme-border transition-colors duration-300">
                <th className="p-4 font-bold w-12 text-center border-r border-theme-border">#</th>
                <th className="p-4 font-bold border-r border-theme-border">Description</th>
                <th className="p-4 font-bold w-48 text-right">Price (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} className="border-b border-theme-border text-theme-main transition-colors duration-300">
                  <td className="p-4 border-r border-theme-border text-center font-medium">{index + 1}</td>
                  <td className="p-4 border-r border-theme-border font-bold">{product.name}</td>
                  <td className="p-4 text-right font-medium">
                    {Number(product.salePrice || product.price).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}

              {/* GRAND TOTAL ROW */}
              <tr className="bg-brand text-black transition-colors duration-300">
                <td colSpan={2} className="p-4 text-right font-bold uppercase tracking-widest text-sm border-r border-black/20">
                  Grand Total
                </td>
                <td className="p-4 text-right font-black text-lg">
                  {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs text-theme-muted pt-8 border-t border-theme-border transition-colors duration-300">
          Generated by {settings?.storeName || "EPIC STORE"}
          {settings?.quotationWebsite && ` — ${settings.quotationWebsite}`}
        </div>

      </div>
    </div>
  );
}