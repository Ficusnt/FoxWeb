export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ authenticated: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};