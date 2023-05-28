import { serve } from 'https://deno.land/std@0.189.0/http/server.ts';

function webHandler(_req: Request): Response {
  return new Response('howdy! :)', { status: 200 });
}

const port = parseInt(Deno.env.get('PORT') || '8080');

console.log('howdy! i\'m times! :)');
console.log('times is listening on port ', port);
await serve(webHandler, { port });
