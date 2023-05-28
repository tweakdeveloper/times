import { Application } from 'https://deno.land/x/oak@v12.5.0/mod.ts';

const app = new Application();
const port = parseInt(Deno.env.get('PORT') || '8080');

app.use(function (ctx) {
  ctx.response.body = 'howdy! :)';
});

console.log('howdy! i\'m times! :)');
console.log('times is listening on port ', port);
await app.listen({ port });
