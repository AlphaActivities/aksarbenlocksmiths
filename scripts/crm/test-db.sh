#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# Isolated, disposable containers only. No host port or production database connection.
for run in 1 2; do
  container="c1-crm-policy-test-$$-$run"
  cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; }
  trap cleanup EXIT
  docker run --detach --name "$container" -e POSTGRES_HOST_AUTH_METHOD=trust postgres:15-alpine >/dev/null
  ready=false
  for attempt in {1..30}; do
    if docker exec "$container" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then ready=true; break; fi
    sleep 1
  done
  if [[ "$ready" != true ]]; then echo 'Disposable database did not start' >&2; exit 1; fi
  docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/crm/bootstrap.sql >/dev/null
  for migration in supabase/migrations/*.sql; do
    docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < "$migration" >/dev/null
  done
  docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/crm/policies.sql
  cleanup
  trap - EXIT
  echo "Fresh migration/policy run $run passed"
done
