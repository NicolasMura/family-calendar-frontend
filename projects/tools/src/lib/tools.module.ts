import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendorModule } from 'projects/vendor/src/public-api';
import { EventDialogComponent } from './dialogs/event/event-dialog.component';
import { ToolsComponent } from './tools.component';



@NgModule({
  declarations: [ToolsComponent, EventDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VendorModule
  ],
  exports: [ToolsComponent]
})
export class ToolsModule { }
