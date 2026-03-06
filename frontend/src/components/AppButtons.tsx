import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PrimaryButton(props: ButtonProps) {
  return <Button {...props} className={cn('rounded-full px-5', props.className)} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <Button variant="secondary" {...props} className={cn('rounded-full px-5', props.className)} />;
}

export function IconButton(props: ButtonProps) {
  return <Button size="icon" variant="ghost" {...props} className={cn('rounded-full', props.className)} />;
}

export function FloatingActionButton(props: ButtonProps) {
  return <Button {...props} className={cn('fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full shadow-xl', props.className)} />;
}
