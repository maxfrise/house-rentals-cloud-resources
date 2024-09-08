Currently, the API Gateway used in the house-rentals-ui was manually built through the AWS console as part of an initial proof of concept (POC) to explore the capabilities of an architecture driven purely by AWS Lambda functions.

The goal of this project is to replace that manually created API Gateway and Lambdas with a more scalable solution.

By moving the Lambda code into this repository, we can achieve the following benefits:

* TypeScript (TS) support.
* Unit testing.
* History tracking via version control.
* Pre-compilation and minification.
* Elimination of direct interaction with the AWS console.

In addition to including the Lambda code in this repository, this project will ensure that the infrastructure required to run the API Gateway is also built using Terraform. This approach will allow for smoother migrations between AWS accounts if necessary.

Another key advantage of adopting Infrastructure as Code (IaC) is that any infrastructure changes are tracked within the GitHub history, making them easy to review, revert, and iterate also reducing the need to directly interact with the AWS console.

# Current migrated lambdas
- initLease
- paymentCollector

# Missing lambdas
- createHouse
- createLease
- getHouses
- houseOverview

# Api gateway resource - lambda maping

PUT_/collectpayment -> paymentCollector
POST_/createhouse   -> createHouse
POST_/createlease   -> createLease
GET_/gethouses      -> getHouses
GET_/houseoverview  -> houseOverview
POST_/initlease     -> initLease