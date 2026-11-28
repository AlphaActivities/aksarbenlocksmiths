import postgres from 'postgres';

export async function verifyQueueConnection(binding) {
  const sql = postgres(binding.connectionString, { max: 1, fetch_types: false, connect_timeout: 10 });
  try {
    const [row] = await sql`
      select current_user as identity, status
      from engine_v2.queue_status(${'cfbef3fdb93ee1ca8aa7f9995c1f67839ab44217cf09119bd87e4856f62c847b'})
      /* alpha-v2-private-worker-queue-smoke */
    `;
    if (row?.identity !== 'alpha_v2_runner_login' || row.status !== 'verified') throw Error('Unexpected Alpha Dev queue status');
  } finally {
    await sql.end({ timeout: 3 });
  }
}
