import { renderBrandIcon } from "@/lib/brand-icon";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  return renderBrandIcon(Number(size));
}
