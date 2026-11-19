#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
network="c1-crm-http-$$"
pg="$network-pg"
rest="$network-rest"
cleanup() { docker rm -f "$rest" "$pg" >/dev/null 2>&1 || true; docker network rm "$network" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker network create "$network" >/dev/null
docker run -d --name "$pg" --network "$network" --network-alias db -e POSTGRES_HOST_AUTH_METHOD=trust postgres:15-alpine >/dev/null
for attempt in {1..30}; do if docker exec "$pg" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then break; fi; sleep 1; done
docker exec -i "$pg" psql -U postgres -v ON_ERROR_STOP=1 < tests/crm/bootstrap.sql >/dev/null
for migration in supabase/migrations/*.sql; do docker exec -i "$pg" psql -U postgres -v ON_ERROR_STOP=1 < "$migration" >/dev/null; done
docker exec -i "$pg" psql -U postgres -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000002'),('10000000-0000-4000-8000-000000000003'),('10000000-0000-4000-8000-000000000004');
SQL
docker run -d --name "$rest" --network "$network" -p 127.0.0.1::3000 -e PGRST_DB_URI=postgres://postgres@db:5432/postgres -e PGRST_DB_SCHEMAS=public -e PGRST_DB_ANON_ROLE=anon -e PGRST_JWT_SECRET=c1-disposable-local-test-signing-key-never-production postgrest/postgrest:v12.2.3 >/dev/null
port=$(docker inspect --format '{{(index (index .NetworkSettings.Ports "3000/tcp") 0).HostPort}}' "$rest")
for attempt in {1..30}; do if curl -s -o /dev/null "http://127.0.0.1:$port/"; then break; fi; sleep 1; done
CRM_TEST_REST_URL="http://127.0.0.1:$port" node tests/crm/http-integration.mjs

CRM_TEST_REST_URL="http://127.0.0.1:$port" node tests/crm/intake-http-integration.mjs
