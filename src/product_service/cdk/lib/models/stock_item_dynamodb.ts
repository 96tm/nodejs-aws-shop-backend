import { AttributeValue } from '@aws-sdk/client-dynamodb';

export interface StockItemDynamoDb extends Record<string, AttributeValue> {
  product_id: AttributeValue.SMember;
  count: AttributeValue.NMember;
}
