import { useState } from 'react';
import {
  Button,
  Calendar,
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Switch,
  FormItem,
  FormGroup,
  Badge,
  DatePicker,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './index';
import { Eye, EyeClosed, Mail, User } from 'lucide-react';

function App() {
  const [type, setType] = useState<'text' | 'password'>('password');
  const [date, setDate] = useState<Date>();

  return (
    <div className="p-5 space-y-5">
      <Badge color="danger" variant="shadow" size="sm">
        Vite + React
      </Badge>
      <Calendar mode="single" selected={date} onSelect={setDate} autoFocus />
      <Button variant="fill" color="primary" size="default">
        Primary
      </Button>
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
            <SelectValue className="text-slate-400" placeholder="Select a fruit" />
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
          addOnStart={
            <select className="form-select">
              <option value="text">Text</option>
              <option value="password">Password</option>
            </select>
          }
          prefix={(<User size={16} />) as any}
          suffix=".com"
          addOnEnd={
            <button type="button" onClick={() => setType(type === 'text' ? 'password' : 'text')}>
              {type === 'text' ? <Eye size={16} /> : <EyeClosed size={16} />}
            </button>
          }>
          <Input type={type} id="password" placeholder="Enter your password" />
        </FormGroup>
      </FormItem>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <div className="space-y-4">
            <div className="space-y-1 p-3">
              <h2 className="text-lg font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">
                Make changes to your account here. Click save when you're done.
              </p>
            </div>
            <div className="space-y-2 p-3">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Pedro Duarte" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="@peduarte" />
              </div>
            </div>
            <div className="flex justify-end p-3">
              <Button>Save changes</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="password">
          <div className="space-y-4">
            <div className="space-y-1 p-3">
              <h2 className="text-lg font-semibold">Password</h2>
              <p className="text-sm text-muted-foreground">
                Change your password here. After saving, you'll be logged out.
              </p>
            </div>
            <div className="space-y-2 p-3">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Pedro Duarte" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="@peduarte" />
              </div>
            </div>
            <div className="flex justify-end p-3">
              <Button>Save password</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
