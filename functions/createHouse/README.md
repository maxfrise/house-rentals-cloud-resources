# createHouse

Function in charge of creating the house entity

### Pre migration Api gateway:

https://us-west-2.console.aws.amazon.com/apigateway/main/apis/6vvo3wbd31/resources?api=6vvo3wbd31&region=us-west-2

### Pre migration lambda

https://us-west-2.console.aws.amazon.com/lambda/home?region=us-west-2#/functions/createHouse?tab=code

### TODOS

- [x] Publish code to AWS
- [ ] Create infra code for new API gateway

## Sample curl

```bash
curl --request POST \
  --url https://staging.api.maxfrise.com/createhouse \
  --header 'Content-Type: application/json' \
  --data '{
  "landlord": "email#audel91@gmail.com",
  "houseId": "4567",
	"houseFriendlyName": "houseInstaging",
  "address": "las perlas 2012",
  "details": "super nice house!",
  "landlords": [
    {
      "name": "Yolanda",
      "phone": "+15093120388"
    }
  ],
  "leaseStatus": "AVAILABLE",
  "tenants": [
    {
      "name": "Javier",
      "phone": "+523121186644"
    }
  ]
}'
```

## Sample event

```json
{
  "landlord": "email#audel91@gmail.com",
  "houseId": "4567",
  "houseFriendlyName": "houseInstaging",
  "address": "las perlas 2012",
  "details": "super nice house!",
  "landlords": [
    {
      "name": "Yolanda",
      "phone": "+15093120388"
    }
  ],
  "leaseStatus": "AVAILABLE",
  "tenants": [
    {
      "name": "Sergio",
      "phone": "+523121186644"
    }
  ]
}
```

## Sample response

```json
{
  "$metadata": {
    "httpStatusCode": 200,
    "requestId": "D1QSIE223S811HVJDB0EVL2S83VV4KQNSO5AEMVJF66Q9ASUAAJG",
    "attempts": 1,
    "totalRetryDelay": 0
  }
}
```
