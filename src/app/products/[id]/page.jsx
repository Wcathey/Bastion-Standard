import ProductDetail from "@/components/ProductsPage/ProductDetail";

export default async function ProductPage({ params }) {
  const { id } = await params;
  return <ProductDetail productId={id} />;
}
