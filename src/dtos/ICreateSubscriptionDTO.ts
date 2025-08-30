export default interface ICreateSubscriptionDTO {
  clientId: string;
  productKey: string;
  detail?: object;
  active?: boolean;
  verifyPermissionHub?: boolean;
}
