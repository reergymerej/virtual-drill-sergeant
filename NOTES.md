# Fri Jun 12 19:46:58 PDT 2020
## Control over which commands are issued

select screen to decide on exercises I'd like to see that I can change at any
time

This will solve problems 1 and 2.  Add a simple list that shows all commands.
Enable/disable them individually.  This requires a service to update by
command id instead of log id.  That requires a new endpoint.  Create these,
update the UI, and revel in the glory.

curl -X PATCH https://cmsvl04jha.execute-api.us-east-1.amazonaws.com/prod/VirtualDrillSergeant/1/commands/9 \
  -i \
  --header 'Content-Type: application/json' \
  --data '{"disabled":false}'
