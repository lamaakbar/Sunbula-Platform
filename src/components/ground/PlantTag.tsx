import QRCode from "qrcode";

export async function PlantTag({ code, caption }: { code: string; caption: string }) {
  if (!/^[A-Za-z0-9-]{1,40}$/.test(code)) {
    return <p className="font-mono text-sm text-forest">{code}</p>;
  }
  const svg = await QRCode.toString(code, {
    type: "svg",
    margin: 1,
    width: 168,
    errorCorrectionLevel: "M",
    color: { dark: "#163D2A", light: "#FFFFFF" },
  });
  return (
    <div className="w-fit rounded-[1.4rem] bg-white p-4 ring-1 ring-sand">
      <div className="[&_svg]:h-40 [&_svg]:w-40" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="mt-2 text-center font-mono text-sm font-semibold text-forest">{code}</p>
      <p className="mt-1 max-w-40 text-center text-xs leading-5 text-muted">{caption}</p>
    </div>
  );
}
