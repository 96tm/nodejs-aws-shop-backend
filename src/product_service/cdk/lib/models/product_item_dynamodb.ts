import { AttributeValue } from '@aws-sdk/client-dynamodb';

export interface ProductItemDynamoDb extends Record<string, AttributeValue> {
  id: AttributeValue.SMember;
  title: AttributeValue.SMember;
  price: AttributeValue.NMember;
  description: AttributeValue.SMember;
}
