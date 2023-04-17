import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BillService } from 'src/app/services/bill.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.scss']
})
export class ManageOrderComponent implements OnInit {
  displayedColumns:string[]=['name','category','quantity','total','edit'];
  dataSource:any=[];
  manageOrderForm:any=[];
  categorys:any=[];
  products:any=[];
  price:any;
  total:number=0;
  responseMessage:any;


  constructor(  private snackbarService:SnackbarService,
    private ngxService:NgxUiLoaderService,
    private categoryService : CategoryService,
    private productService:ProductService,
    private billService:BillService,
    private fb:FormBuilder) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.getCategories();
    this.initForm();
  }

  initForm(){
    this.manageOrderForm = this.fb.group({
      name: new FormControl(''),
      email: new FormControl('',Validators.required),
      contactNumber :  new FormControl(''),
      paymentMethod : new FormControl(''),
      product: new FormControl(''),
      category: new FormControl(''),
      quantity: new FormControl(''),
      price: new FormControl(''),
      total: new FormControl('0',Validators.required)
    });
  }

  getCategories(){
    this.categoryService.getCategories().subscribe((response:any)=>{
      this.ngxService.stop();
      this.categorys = response;
      console.log(response);
    },(error:any)=>{
      this.ngxService.stop();
      if(error.error?.message)
      {
        this.responseMessage = error.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    });
  }


  getProductsByCategory(value:any){
      this.productService.getProductsByCategory(value.id).subscribe((response:any)=>{
        this.products = response;
        console.log(response);
        this.manageOrderForm.controls['price'].setValue('');
        this.manageOrderForm.controls['quantity'].setValue('');
        this.manageOrderForm.controls['total'].setValue('0');

      },(error:any)=>{
        this.ngxService.stop();  
        if(error.error?.message)
        {
          this.responseMessage = error.error?.message;
        }
        else{
          this.responseMessage = GlobalConstants.genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
      });
  }

  getProductDetails(data:any){
    this.productService.getById(data.id).subscribe((response:any)=>{
      this.price = response[0].price;
      console.log(response);
      console.log(this.price)
      this.manageOrderForm.controls['price'].setValue(response[0].price);
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(this.price*1);
    },(error:any)=>{
      if(error.error?.message)
      {
        this.responseMessage = error.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    });

  }

  setQuantity(data:any){
    var temp = this.manageOrderForm.controls['quantity'].value;
    if(temp>0){
      this.manageOrderForm.controls['total'].setValue(this.manageOrderForm.controls['quantity'].value * this.manageOrderForm.controls['price'].value);
    }
    else if(temp !=0){
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(this.manageOrderForm.controls['quantity'].value * this.manageOrderForm.controls['price'].value);
    }
    
  }

  validateProductAdd(){
    if(this.manageOrderForm.controls['total'].value === 0 || 
    this.manageOrderForm.controls['total'].value === null || this.manageOrderForm.controls['quantity'].value <= 0)
    return true; 
    else

    return false;
  }


  validatesubmit(){
    if(this.manageOrderForm.controls['name'].value === null || this.total === 0 
    || this.manageOrderForm.controls['email'].value === null || this.manageOrderForm.controls['contactNumber'].value === null ||
    this.manageOrderForm.controls['paymentMethod'].value === null)
    return true

    else return false;
  }

  add(){
    var formData = this.manageOrderForm.value;
    var productName = this.dataSource.find((e:{id:number;})=>e.id == formData.product.id);
    if(productName === undefined)
    {
      this.total = this.total + formData.total;
      this.dataSource.push({id : formData.product.id,
        name:formData.product.name,
        category: formData.category.name,
        quantity:formData.quantity,
        price:formData.price,
        total:formData.total});

        this.dataSource =[...this.dataSource];
        this.snackbarService.openSnackBar(GlobalConstants.productAdded,"success");
    } else{
      this.snackbarService.openSnackBar(GlobalConstants.productExistError,GlobalConstants.error);
    }
  }

  handledeleteAction(data:any,element:any){
    this.total = this.total - element.total;
    this.dataSource.splice(data,1);
    this.dataSource = [...this.dataSource];

  }

  Submit(){
    var formData = this.manageOrderForm.value;
    var data ={
      name:formData.name,
      email:formData.email,
      contactNumber : formData.contactNumber,
      paymentMethod:formData.paymentMethod,
      total:formData.total,
      productDetails : JSON.stringify(this.dataSource)
    }

    this.billService.generateReport(data).subscribe((response:any)=>{
      this.downloadFile(response?.uuid);
      this.manageOrderForm.reset();
      this.dataSource = [];
      this.total = 0;

    },(error:any)=>{
      if(error.error?.message)
      {
        this.responseMessage = error.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    });

  }
  downloadFile(fileName:any){

    var uuid = {
      uuid:fileName
    }
    this.billService.getPdf(uuid).subscribe((response:any)=>{
      saveAs(response,fileName +' .pdf');
      this.ngxService.stop();
    })
  }

}
