import { Status } from 'https://deno.land/std@0.189.0/http/mod.ts';
import {
  Database,
  DataTypes,
  Model,
  SQLite3Connector,
} from 'https://deno.land/x/denodb@v1.4.0/mod.ts';
import { Application, Router } from 'https://deno.land/x/oak@v12.5.0/mod.ts';

// models
class Punch extends Model {
  static table = 'punches';
  static timestamps = false;

  static fields = {
    id: {
      primaryKey: true,
      autoIncrement: true,
    },
    worker: DataTypes.INTEGER,
    isInPunch: DataTypes.BOOLEAN,
    time: DataTypes.DATETIME,
  };
}

// set up DB
const connection = new SQLite3Connector({
  filepath: './punches.db',
});
const db = new Database(connection);
db.link([Punch]);
await db.sync();

// set up server
const port = parseInt(Deno.env.get('PORT') || '8080');
const router = new Router();

// handle requests
router
  .get('/', (ctx) => ctx.response.body = 'howdy! :)')
  .post('/punch', async function (ctx) {
    const body = ctx.request.body();
    if (body.type === 'form-data') {
      const formData = await body.value.read();
      const isInPunchFormData = formData.fields.isInPunch;
      if (isInPunchFormData !== 'true' && isInPunchFormData !== 'false') {
        ctx.response.body = 'invalid in punch status';
        ctx.response.status = Status.BadRequest;
        return;
      }
      const isInPunch = isInPunchFormData === 'true';
      const worker = formData.fields.worker;
      if (worker === '') {
        ctx.response.body = 'invalid worker ID';
        ctx.response.status = Status.BadRequest;
        return;
      }
      const time = new Date();
      const numPunches = await Punch.count();
      await Punch.create({
        isInPunch,
        time,
        worker,
      });
      if (await Punch.count() == numPunches + 1) {
        ctx.response.body = 'punch created!';
        return;
      } else {
        ctx.response.body = 'failed to create punch';
        ctx.response.status = Status.InternalServerError;
        return;
      }
    } else {
      ctx.response.body = 'invalid body type';
      ctx.response.status = Status.BadRequest;
      return;
    }
  });

// let runner know we're working
console.log('howdy! i\'m times! :)');
console.log('times is listening on port ', port);

// spin up the server
const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port });
