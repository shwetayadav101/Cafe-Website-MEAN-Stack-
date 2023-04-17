import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BillComponent } from '../../bill/bill.component';

@Component({
  selector: 'app-view-bill-products',
  templateUrl: './view-bill-products.component.html',
  styleUrls: ['./view-bill-products.component.scss']
})
export class ViewBillProductsComponent implements OnInit {

  displayedColumns:string[]=['name','category','price','quantity','total'];
  dataSource:any=[];
  data:any;
  constructor(@Inject(MAT_DIALOG_DATA) public dialodData:any,
  public dialogRef:MatDialogRef<BillComponent>) { }

  ngOnInit() {
    this.data = this.dialodData.data;
    this.dataSource = JSON.parse(this.dialodData.data.productDetails)
  }
}
