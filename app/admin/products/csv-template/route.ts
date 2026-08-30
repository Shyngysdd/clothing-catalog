const content = `sku,name,category,price,originalPrice,description,composition,fit,sizes,care\nBIL-001,Чёрная ветровка,Ветровки,45000,59000,"Лёгкая ветровка для городского ритма.","100% нейлон","Свободный крой","S,M,L,XL","Машинная стирка при 30°;Не отбеливать"\nBIL-002,Базовая футболка,Футболки,18000,,"Плотный хлопок на каждый день.","100% хлопок","Прямой крой","S,M,L","Стирать отдельно;Гладить при средней температуре"\n`;

export function GET() {
  return new Response(`\uFEFF${content}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="billion-products-template.csv"',
    },
  });
}
