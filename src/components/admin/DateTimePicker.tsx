import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function DateTimePicker({ value, onChange, label }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  
  const date = value ? new Date(value) : undefined;
  const time = value ? value.slice(11, 16) : '12:00';

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    const [hours, minutes] = time.split(':');
    selectedDate.setHours(parseInt(hours), parseInt(minutes));
    
    onChange(selectedDate.toISOString().slice(0, 16));
  };

  const handleTimeChange = (newTime: string) => {
    if (!date) return;
    
    const [hours, minutes] = newTime.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    
    onChange(newDate.toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP HH:mm') : <span>Selecionar data e hora</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            className="pointer-events-auto"
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
          <div className="p-3 border-t">
            <Label className="text-xs mb-2 block">Hora de Publicação</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
