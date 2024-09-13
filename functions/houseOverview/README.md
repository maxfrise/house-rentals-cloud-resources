# houseOverview

Function of returning the details of a given house

### Pre migration Api gateway:

https://us-west-2.console.aws.amazon.com/apigateway/main/apis/6vvo3wbd31/resources?api=6vvo3wbd31&region=us-west-2

### Pre migration lambda

https://us-west-2.console.aws.amazon.com/lambda/home?region=us-west-2#/functions/getHouses?tab=code

### TODOS

- [x] Publish code to AWS
- [ ] Create infra code for new API gateway

## Sample curl

```bash
curl --request GET \
  --url 'https://api.maxfrise.com/houseoverview?houseid=clhqcayfg000008mb78ug1z0t&user=audel91%40gmail.com' \
  --header 'Content-Type: application/json'
```

## Sample event

```json
{
  "landlord": "email#audel91@gmail.com"
}
```

## Sample response

```json
{
  "house": {
    "landlords": [
      {
        "name": "******",
        "phone": "******"
      }
    ],
    "tenants": [
      {
        "name": "******",
        "phone": "******"
      }
    ],
    "houseId": "******",
    "houseFriendlyName": "******",
    "landlord": "******@gmail.com",
    "address": "******",
    "details": "******",
    "leaseStatus": "LEASED"
  },
  "payments": [
    {
      "landlords": [
        {
          "name": "******",
          "phone": "******"
        }
      ],
      "tenants": [
        {
          "name": "******",
          "phone": "******"
        }
      ],
      "st": "clhqcayfg000008mb78ug1z0t|2023-03-07T00:00:00.000Z|9255e3fe-1869-410c-b444-a17a03279860",
      "houseid": "clhqcayfg000008mb78ug1z0t",
      "status": "PAID",
      "details": [
        {
          "method": "******",
          "amount": "12000"
        }
      ],
      "pk": "p#2023-03-07T00:00:00.000Z"
    }
  ]
}
```
