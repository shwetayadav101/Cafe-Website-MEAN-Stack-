import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CategoryComponent } from '../category/category.component';
import { CategoryService } from 'src/app/services/category.service';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  onAddPRoduct = new EventEmitter();
  onEditProduct = new EventEmitter();

  productForm :any =FormGroup;
  dialogAction : any = "Add";
  action:any ="Add";
  responseMessage:any;
  categorys:any=[];


  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData:any,
  private productService:ProductService,
  private dialogRef : MatDialogRef<ProductComponent>,
  private snackbarService : SnackbarService,
  private categoryService:CategoryService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getCategories();
    }

  initForm(){
    this.productForm = new FormGroup({
      name:new FormControl(''),
      categoryId : new FormControl(''),
      price :  new FormControl(''),
      description : new FormControl('')
    });
    
    if(this.dialogData.action === 'Edit'){
      this.dialogAction ='Edit';
      this.action = "update";
      this.productForm.patchValue(this.dialogAction);
    }
  }

  getCategories(){
    this.categoryService.getCategories().subscribe((response:any)=>{
      this.categorys = response;
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

  handleSubmit(){
    if(this.dialogAction === "Edit"){
      this.edit()
    }
    else{
      this.add()
    }
  }

  add(){
    var formData = this.productForm.value;
    var data = {
      name : formData.name,
      categoryId: formData.categoryId,
      price:formData.price,
      description : formData.description
    }

    this.productService.add(data).subscribe((response:any)=>{
      this.dialogRef.close();
      this.onAddPRoduct.emit();
      this.responseMessage = response?.message;
      this.snackbarService.openSnackBar(this.responseMessage ,"success");
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

  edit(){
    var formData = this.productForm.value;
    var data = {
      id : this.dialogData.data.id,
      name : formData.name,
      categoryId: formData.categoryId,
      price:formData.price,
      description : formData.description
    }

    this.categoryService.update(data).subscribe((response:any)=>{
      this.dialogRef.close();
      this.onEditProduct.emit();
      this.responseMessage = response?.message;
      this.snackbarService.openSnackBar(this.responseMessage ,"success");
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

  
}
