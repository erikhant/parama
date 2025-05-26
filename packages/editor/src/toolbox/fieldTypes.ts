export interface FieldTypeDef {
  id: string;
  label: string;
  image?: string;
  icon?: string;
}
export interface FieldTypes {
  inputs: FieldTypeDef[];
  selections: FieldTypeDef[];
  presentations: FieldTypeDef[];
  [x: string]: FieldTypeDef[];
}
