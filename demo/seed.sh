#!/bin/sh
# Seeds the local demo: a verified demo account and a few sample automations.
# Runs inside a postgres:alpine container (psql + busybox wget are available).
set -eu

API="${API_URL:-http://backend:8080}"
EMAIL="demo@area.dev"
PASSWORD="DemoPassw0rd!"

echo "[seed] waiting for the backend..."
i=0
until wget -q -O /dev/null "$API/about.json" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -gt 120 ]; then echo "[seed] backend not reachable, giving up"; exit 1; fi
  sleep 3
done

post() { # $1=path $2=json [$3=cookie]
  if [ -n "${3:-}" ]; then
    wget -q -O - --header "Content-Type: application/json" --header "Cookie: $3" --post-data "$2" "$API$1"
  else
    wget -q -O - --header "Content-Type: application/json" --post-data "$2" "$API$1"
  fi
}

echo "[seed] creating the demo account"
post /api/auth/register "{\"email\":\"$EMAIL\",\"username\":\"demo\",\"password\":\"$PASSWORD\",\"firstName\":\"Alex\",\"lastName\":\"Martin\"}" >/dev/null 2>&1 \
  || echo "[seed] account already exists"

# Emails are not sent in the demo: mark the address as verified and give admin rights
psql -q -c "UPDATE area.a_user_local_identities SET is_email_verified = true WHERE email = '$EMAIL';"
psql -q -c "UPDATE area.a_users SET is_admin = true WHERE email = '$EMAIL';"

existing=$(psql -tAc "SELECT count(*) FROM area.a_areas a JOIN area.a_users u ON u.id = a.user_id WHERE u.email = '$EMAIL';")
if [ "$existing" -gt 0 ]; then
  echo "[seed] sample automations already present ($existing), nothing to do"
  exit 0
fi

echo "[seed] logging in"
cookie=$(wget -S -q -O /dev/null --header "Content-Type: application/json" \
  --post-data "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "$API/api/auth/login" 2>&1 \
  | sed -n 's/^ *[Ss]et-[Cc]ookie: \([^;]*\).*/\1/p' | paste -sd ';' -)
[ -n "$cookie" ] || { echo "[seed] login failed"; exit 1; }

def() { # $1=service name $2=definition name -> definition id
  psql -tAc "SELECT d.id FROM area.a_action_definitions d JOIN area.a_services s ON s.id = d.service_id WHERE s.name = '$1' AND d.name = '$2' LIMIT 1;"
}

area() { # $1=name $2=description $3=action json $4=reaction json
  post /api/areas/with-links "{\"name\":\"$1\",\"description\":\"$2\",\"actions\":[$3],\"reactions\":[$4],\"layoutMode\":\"linear\"}" "$cookie" >/dev/null
  echo "[seed] created: $1"
}

item() { # $1=definition id $2=name $3=parameters json
  echo "{\"actionDefinitionId\":\"$1\",\"name\":\"$2\",\"parameters\":$3}"
}

area "GitHub issue → Discord alert" \
  "Post a message in the team Discord channel when an issue is opened on the project repository" \
  "$(item "$(def GitHub 'New Issue Created')" 'New Issue Created' '{"repository":"demo-org/area"}')" \
  "$(item "$(def Discord 'Send Message')" 'Send Message' '{"channel_id":"1234567890","content":"New issue opened on AREA"}')"

area "Important email → Slack" \
  "Send a Slack notification when an email from the professor arrives in Gmail" \
  "$(item "$(def Google 'New Email Received')" 'New Email Received' '{"from":"professor@school.edu","subject_contains":"Project"}')" \
  "$(item "$(def Slack 'Send Message')" 'Send Message' '{"channel":"#team","text":"New email from the professor"}')"

area "Pull request → Notion log" \
  "Create a Notion page for every new pull request targeting main, to keep a review log" \
  "$(item "$(def GitHub 'New Pull Request')" 'New Pull Request' '{"repository":"demo-org/area","target_branch":"main"}')" \
  "$(item "$(def Notion 'Create Page')" 'Create Page' '{"page_id":"review-log","title":"New PR to review"}')"

area "Slack bug report → GitHub issue" \
  "Turn messages posted in the #bugs Slack channel into GitHub issues" \
  "$(item "$(def Slack 'New Message')" 'New Message' '{"channel":"#bugs"}')" \
  "$(item "$(def GitHub 'Create Issue')" 'Create Issue' '{"repository":"demo-org/area","title":"Bug reported on Slack","labels":["bug"]}')"

echo "[seed] done — open http://localhost:3000 and log in with $EMAIL / $PASSWORD"
