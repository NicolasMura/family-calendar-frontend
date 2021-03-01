import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendorModule } from 'projects/vendor/src/public-api';
import { EventDialogComponent } from './components/dialogs/event/event-dialog.component';
import { ShowMoreEventsDialogComponent } from './components/dialogs/event/show-more-events-dialog.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { EventsFilterPipe } from './pipes/event-filter.pipe';
import { ToolsComponent } from './tools.component';



@NgModule({
  declarations: [
    ToolsComponent,
    EventDialogComponent,
    ShowMoreEventsDialogComponent,
    AutofocusDirective,
    EventsFilterPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VendorModule
  ],
  exports: [
    ToolsComponent,
    AutofocusDirective,
    EventsFilterPipe
  ]
})
export class ToolsModule { }
