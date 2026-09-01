const header = "sku;name;category;price;originalPrice;description;composition;fit;sizes;care;imageColor;colorGroup;color;colorSwatch";

const exampleRows = [
  header,
  'BIL-001;Ветровка Storm;Ветровки;58900;64900;"Лёгкая ветровка для городского ритма.";"55% нейлон, 45% полиэстер";"Прямой крой";"S,M,L";"Не стирать;Не отбеливать";#242424;storm-jacket;Чёрный;#242424',
  'BIL-002;Ветровка Storm;Ветровки;58900;64900;"Лёгкая ветровка для городского ритма.";"55% нейлон, 45% полиэстер";"Прямой крой";"S,M,L";"Не стирать;Не отбеливать";#66714F;storm-jacket;Оливковый;#66714F',
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
