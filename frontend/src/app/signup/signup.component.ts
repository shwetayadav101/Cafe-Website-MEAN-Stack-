import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Route, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import {SnackbarService} from '../services/snackbar.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GlobalConstants } from '../shared/global-constants';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
   
  signupForm:any=FormGroup;
  responseMessage:any;

  constructor(
    private router:Router,
    private snackbarService:SnackbarService,
    private userService: UserService,
    private dialogRef: MatDialogRef<SignupComponent>,
    private ngxService:NgxUiLoaderService) { }

  ngOnInit(): void {
    this.initForm();
   
  }

  initForm(){
     this.signupForm = new FormGroup({
      name:new FormControl('',[Validators.required,Validators.pattern(GlobalConstants.nameRegex)]),
      email:new FormControl(''),
      contactNumber:new FormControl(''),
      password:new FormControl('')
    })
  }

  handleSubmit(){
    this.ngxService.start();
    var formData = this.signupForm.value;
    var data={
      name: formData.name,
      email : formData.email,
      contactNumber : formData.contactNumber,
      password : formData.password

    }

    this.userService.signup(data).subscribe((response:any)=>{
      this.ngxService.stop();
      this.dialogRef.close();
      this.responseMessage = response?.message;
      this.snackbarService.openSnackBar(this.responseMessage ," ");
      this.router.navigate(['/']);
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

}
