const header = "sku;name;category;price;originalPrice;description;composition;fit;sizes;care;imageColor";

const exampleRows = [
  header,
  'BIL-001;Ветровка Storm;Ветровки;58900;64900;"Лёгкая ветровка для городского ритма.";"55% нейлон, 45% полиэстер";"Прямой крой";"S,M,L";"Не стирать;Не отбеливать";#242424',
  'BIL-002;Футболка Boxy;Футболки;32900;;"Плотный хлопок на каждый день.";"100% хлопок";"Свободный boxy-силуэт";"S,M,L,XL";"Стирка при 30°;Гладить с изнанки";#B88A87',
].join("\n");

export function GET(request: Request) {
  const isExample = new URL(request.url).searchParams.get("mode") === "example";
  const content = isExample ? `${exampleRows}\n` : `${header}\n`;
  const fileName = isExample ? "products-example.csv" : "products-template.csv";

  return new Response(`\uFEFF${content}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
