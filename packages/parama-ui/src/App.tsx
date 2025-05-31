import { useState } from 'react';
import { Button } from './components/ui/button';
import { Calendar } from './components/ui/calendar';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Slider } from './components/ui/slider';
import { Switch } from './components/ui/switch';
import { FormItem } from './components/ui/form-item';
import { FormGroup } from './components/ui/form-group';
import { Eye, EyeClosed, Mail, User } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { DatePicker } from './components/ui/datepicker';

function App() {
  const [count, setCount] = useState(0);
  const [type, setType] = useState<'text' | 'password'>('password');
  const [date, setDate] = useState<Date>();

  return (
    <div className="p-5 space-y-5">
      <Badge color="danger" variant="shadow" size="sm">
        Vite + React
      </Badge>
      <div className="card">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />

        <Button
          variant="shadow"
          color="danger"
          size="default"
          onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <form className="space-y-3">
        <FormItem>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Your name" />
        </FormItem>
        <FormItem id="birthdate">
          <Label>Birthdate</Label>
          <DatePicker
            mode="single"
            selected={date}
            onSelect={setDate}
            container={document.getElementById('birthdate')}
          />
        </FormItem>
        <FormItem>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue
                className="text-slate-400"
                placeholder="Select a fruit"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormItem>
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
        </div>
        <div>
          <RadioGroup defaultValue="comfortable">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="r1" />
              <Label htmlFor="r1">Default</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="r2" />
              <Label htmlFor="r2">Comfortable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="r3" />
              <Label htmlFor="r3">Compact</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <Slider defaultValue={[50]} max={100} step={1} className="w-[60%]" />
        </div>
        <FormItem orientation="horizontal">
          <Label htmlFor="airplane-mode">Airplane Mode</Label>
          <Switch id="airplane-mode" className="ml-auto" />
        </FormItem>
        <FormItem>
          <Label htmlFor="mail">Email</Label>
          <FormGroup suffix=".com" prefix={(<Mail size={16} />) as any}>
            <Input type="email" id="mail" />
          </FormGroup>
        </FormItem>
        <FormItem orientation="vertical">
          <Label htmlFor="username">Username</Label>
          <FormGroup prefix={(<User size={16} />) as any}>
            <Input id="username" placeholder="Enter your username" />
          </FormGroup>
          <p className="form-description">Enter your best username</p>
        </FormItem>
        <FormItem orientation="horizontal">
          <div className="form-captions">
            <Label htmlFor="password">Password</Label>
            <p className="form-description">Enter your best password</p>
          </div>
          <FormGroup
            addOnEnd={
              <button
                type="button"
                onClick={() => setType(type === 'text' ? 'password' : 'text')}>
                {type === 'text' ? <Eye size={16} /> : <EyeClosed size={16} />}
              </button>
            }>
            <Input
              type={type}
              id="password"
              placeholder="Enter your password"
            />
          </FormGroup>
        </FormItem>
      </form>
    </div>
  );
}

export default App;
