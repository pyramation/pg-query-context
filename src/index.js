function setContext(ctx) {
  return Object.keys(ctx || {}).reduce((m, el) => {
    m.push(`SELECT set_config('${el}', '${ctx[el]}', true);`);
    return m;
  }, []);
}

async function execContext(client, ctx) {
  const local = setContext(ctx);
  for (let i = 0; i < local.length; i++) {
    const set = local[i];
    await client.query(set);
  }
}

export default async ({ client, context = {}, query = '', variables = [] }) => {
  let value = null;
  try {
    await client.query('BEGIN');
    await execContext(client, context);
    value = await client.query(query, variables);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
  return value;
};
