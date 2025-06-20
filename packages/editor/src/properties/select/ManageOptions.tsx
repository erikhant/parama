import type { FieldGroupItem } from '@form-builder/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormItem,
  Input,
  Label
} from '@parama-ui/react';
import { RepetableField } from '../../components';

type ManageOptionsProps = {
  values?: FieldGroupItem[];
  onChange?: ((value: FieldGroupItem[]) => void) | undefined;
  children?: React.ReactNode;
};

export const ManageOptions = ({ onChange, values, children }: ManageOptionsProps) => {
  const defaultValue: FieldGroupItem = {
    id: Date.now(),
    label: '',
    value: ''
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Manage options</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-gray-700">Options</DialogTitle>
          <DialogDescription>Manage your options here</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 mt-2 mb-5">
          <RepetableField
            values={values}
            name="options"
            defaultValue={defaultValue}
            onChange={onChange}>
            {({ value, onChange, name, key }) => (
              <div className="flex items-start gap-2" key={key}>
                <FormItem className="w-full">
                  <Label htmlFor={name}>Option label</Label>
                  <Input
                    id={name}
                    name={name}
                    value={value.label}
                    onChange={(e) => onChange({ ...value, label: e.target.value })}
                    placeholder="Option"
                  />
                </FormItem>
                <FormItem className="w-full">
                  <Label htmlFor={name}>Option value</Label>
                  <Input
                    id={name}
                    name={name}
                    value={value.value}
                    onChange={(e) => onChange({ ...value, value: e.target.value })}
                    placeholder="Option"
                  />
                </FormItem>
              </div>
            )}
          </RepetableField>
        </div>
      </DialogContent>
    </Dialog>
  );
};
