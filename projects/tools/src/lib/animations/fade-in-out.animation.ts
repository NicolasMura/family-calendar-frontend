import {
  trigger,
  animate,
  transition,
  style
} from '@angular/animations';

export const fadeInOutAnimation = trigger('fadeInOutAnimation', [
  transition(
    ':enter', // when a DOM element is being added
    [
      style({ opacity: 0 }),
      animate('400ms ease-in',
      style({ opacity: 1 }))
    ]
  ),
  transition(
    ':leave', // when a DOM element is being removed
    [
      style({ opacity: 1 }),
      animate('400ms ease-out',
      style({ opacity: 0 }))
    ]
  )
]);
