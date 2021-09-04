## paradb-api-schema

This repository contains:
 - A small schema builder that sits on top of [msgpackr](https://github.com/kriszyp/msgpackr) for serialization / deserialization
 - Object and req/res types for [paradb](https://github.com/anonymousthing/paradb-api)

### Schema builder

The schema builder allows you to define your schema in Typescript, and gives you serialization / deserialization functions back.

Example:

```ts
const apiSuccess = rec('apiSuccess', {
  success: bool('success', true),
});
const apiError = rec('apiError', {
  success: bool('success', false),
  statusCode: num('statusCode'),
  errorMessage: str('errorMessage'),
});
const apiResponse = union('apiResponse', 'success', [apiSuccess, apiError]);
const {
  serialize: serializeApiResponse,
  deserialize: deserializeApiResponse,
} = apiResponse;


// Example backend code:
const resp = serializeApiResponse({
  success: false,
  statusCode: 404,
  errorMessage: 'Not found',
}); // -> Uint8Array buffer to be sent over the wire
res.send(Buffer.from(resp));


// ... and then to be deserialized on the other side of the wire, in the frontend:
const fetchResp = new Uint8Array(await fetch(...).then(r => r.arrayBuffer()));
const resp = deserializeApiResponse(fetchResp);
if (!resp.success) {
  alert(`Server responded with ${statusCode} - ${errorMessage}`);
}
// ...
```
