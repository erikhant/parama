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
  TabsTrigger,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  DateRange
} from './index';
import { Eye, EyeClosed, Mail, User } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './components/ui/accordion';

function App() {
  const [type, setType] = useState<'text' | 'password'>('password');
  const [date, setDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div className="p-8 space-y-5">
      <Badge color="primary" variant="shadow">
        Parama UI
      </Badge>

      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Button Fill Variants</h5>
        <div className="flex items-center space-x-2">
          <Button variant="fill" color="primary" size="default">
            Primary
          </Button>
          <Button variant="fill" color="secondary" size="default">
            Secondary
          </Button>
          <Button variant="fill" color="success" size="default">
            Success
          </Button>
          <Button variant="fill" color="warning" size="default">
            Warning
          </Button>
          <Button variant="fill" color="danger" size="default">
            Danger
          </Button>
        </div>
      </div>
      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Button Outline Variants</h5>
        <div className="flex items-center space-x-2">
          <Button variant="outline" color="primary" size="default">
            Primary
          </Button>
          <Button variant="outline" color="secondary" size="default">
            Secondary
          </Button>
          <Button variant="outline" color="success" size="default">
            Success
          </Button>
          <Button variant="outline" color="warning" size="default">
            Warning
          </Button>
          <Button variant="outline" color="danger" size="default">
            Danger
          </Button>
        </div>
      </div>
      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Button Ghost Variants</h5>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" color="primary" size="default">
            Primary
          </Button>
          <Button variant="ghost" color="secondary" size="default">
            Secondary
          </Button>
          <Button variant="ghost" color="success" size="default">
            Success
          </Button>
          <Button variant="ghost" color="warning" size="default">
            Warning
          </Button>
          <Button variant="ghost" color="danger" size="default">
            Danger
          </Button>
        </div>
      </div>
      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Button Shadow Variants</h5>
        <div className="flex items-center space-x-2">
          <Button variant="shadow" color="primary" size="default">
            Primary
          </Button>
          <Button variant="shadow" color="secondary" size="default">
            Secondary
          </Button>
          <Button variant="shadow" color="success" size="default">
            Success
          </Button>
          <Button variant="shadow" color="warning" size="default">
            Warning
          </Button>
          <Button variant="shadow" color="danger" size="default">
            Danger
          </Button>
        </div>
      </div>
      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Button Sizes</h5>
        <div className="flex items-center space-x-2">
          <Button variant="fill" color="primary" size="xs">
            Size XS
          </Button>
          <Button variant="fill" color="secondary" size="sm">
            Size SM
          </Button>
          <Button variant="fill" color="success" size="default">
            Size DEFAULT
          </Button>
          <Button variant="fill" color="danger" size="lg">
            Size LG
          </Button>
        </div>
      </div>
      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Accordion</h5>
        <Accordion type="single" collapsible className="w-[300px]">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Forms</h5>
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
        <FormItem className="flex items-center space-x-2 space-y-0">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </FormItem>
        <RadioGroup defaultValue="comfortable">
          <FormItem className="flex items-center space-x-2 space-y-0">
            <RadioGroupItem value="default" id="r1" />
            <Label htmlFor="r1">Default</Label>
          </FormItem>
          <FormItem className="flex items-center space-x-2 space-y-0">
            <RadioGroupItem value="comfortable" id="r2" />
            <Label htmlFor="r2">Comfortable</Label>
          </FormItem>
          <FormItem className="flex items-center space-x-2 space-y-0">
            <RadioGroupItem value="compact" id="r3" />
            <Label htmlFor="r3">Compact</Label>
          </FormItem>
        </RadioGroup>
        <FormItem>
          <Slider defaultValue={[50]} max={100} step={1} className="w-[60%]" />
        </FormItem>
        <FormItem orientation="horizontal">
          <Label htmlFor="airplane-mode">Airplane Mode</Label>
          <Switch id="airplane-mode" className="" />
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
      </div>
      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Calendar</h5>
        <p className="text-sm text-gray-600 leading-relaxed">
          The calendar component allows you to select a date. It supports different date selection
          modes such as single, multiple, and range and customizable and can be styled using the
          `className` prop. <br />
          The selected date is controlled by the `selected` prop and can be updated using the
          `onSelect` prop. <br />
          The `autoFocus` prop will focus the calendar when it is mounted. <br />
          The `mode` prop can be set to "single" for single date selection or "range" for selecting
          a range of dates. <br />
          The `selected` prop should be a Date object or null if no date is selected. <br />
          The `onSelect` prop should be a function that receives the selected date as an argument.{' '}
          <br />
          The `autoFocus` prop will focus the calendar when it is mounted.
        </p>
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </div>
      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Tabs</h5>
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
      <div className="border p-4 rounded-md space-y-5">
        <h5 className="font-semibold text-lg text-gray-700">Sheet</h5>
        <p className="text-sm text-gray-600 leading-relaxed">
          The sheet component is a modal that can be used to display content or forms. It can be
          triggered by a button and can contain a header, description, and footer. The content of
          the sheet can be customized using the `children` prop. The `side` prop can be used to
          specify which side of the screen the sheet should appear on (e.g., 'left', 'right', 'top',
          'bottom').
          <br />
          The `SheetTrigger` component is used to open the sheet, and the `SheetClose` component is
          used to close it.
          <br />
          The `SheetContent` component contains the main content of the sheet, while the
          `SheetHeader`, `SheetTitle`, and `SheetDescription` components are used to display the
          header and description of the sheet.
          <br />
          The `SheetFooter` component is used to display the footer of the sheet, which can contain
          buttons or other actions.
          <br />
          The `SheetPortal` component is used to render the sheet in a portal, allowing it to be
          displayed above other content on the page.
        </p>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <FormItem>
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input className="col-span-3" />
              </FormItem>
              <FormItem>
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input className="col-span-3" />
              </FormItem>
              <FormItem>
                <Label htmlFor="birthdate" className="text-right">
                  Birthdate
                </Label>
                <DatePicker
                  selected={dateRange}
                  mode="range"
                  min={3}
                  max={5}
                  onSelect={setDateRange}
                />
              </FormItem>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit">Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default App;
