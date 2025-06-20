export interface FieldTypeDef {
  id: string;
  label: string;
  group: 'input' | 'selection' | 'presentation' | 'other';
  description?: string;
  image?: string;
  icon?: object | string; // Can be a React component or a string (e.g., emoji)
}
export interface FieldTypes {
  inputs: FieldTypeDef[];
  selections: FieldTypeDef[];
  presentations: FieldTypeDef[];
  [x: string]: FieldTypeDef[];
}
