/*******************************************************************************
 *
 * Great Innovus Solutions Private Limited
 *
 * Module       : Appointment
 *
 * Description : Appointment contolller
 *
 * Date        :
 *
 * Version    : 1.0
 *
 ******************************************************************************/
 (function(){
  'use strict';
  angular
    .module('practysApp')
     .controller('appointmentController',appointmentController);
    appointmentController.$inject=['$scope','appointmentService','utilService','dashboardservices','toastr','$state','$stateParams','$location','$anchorScroll','ngDialog','recordsServices'];

    function appointmentController($scope,appointmentService,utilService,dashboardservices,toastr,$state,$stateParams,$location,$anchorScroll,ngDialog,recordsServices){
        var vm                          = this;
        vm.tab                          = 1;
        vm.data                         = [];
        vm.sendData                     = [];
        vm.data.doctorDetails           = [];
        vm.data.currentAppointment      = [];
        vm.data.previousAppointment     = [];
        vm.data.clinicDetails           = [];
        vm.data.clinicAvaliable         = [];
        vm.data.date                    = {};
        vm.data.date.days               = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        vm.data.currentDate             = new Date();
        vm.data.previousData            = new Date(vm.data.currentDate.getFullYear(),vm.data.currentDate.getMonth()+1,vm.data.currentDate.getDate());
        vm.data.appointmentTime         = [];
        vm.sendData.service             = {};
        vm.sendData.service.mins        = 1;
        vm.data.pageSize                = 4;
        vm.data.currentPage             = 0;
         vm.data.patientAhead           = 0;
        vm.data.appoinmentCancelData    = {};
        vm.data.currentDate             = new Date();
        vm.data.userDetails             = utilService.RestoreStateObj(utilService.getItem('user'));
        vm.onpageLoad                   = onpageLoad;
        vm.appointmentCalc              = appointmentCalc;
        // vm.getClinicDetails             = getClinicDetails;
        vm.getDoctorDetails             = getDoctorDetails;
        vm.checkAppointmentDate         = checkAppointmentDate;
        vm.findAppointment              = findAppointment;
        vm.makeAnAppointment            = makeAnAppointment;
        vm.dateAdd                      = dateAdd;
        vm.totalNumberOfitem            = totalNumberOfitem;
        vm.dateDisabled                 = dateDisabled;
        vm.getServiceDetails            = getServiceDetails;
        vm.getSpecailityDetails         = getSpecailityDetails;
        vm.cancelAppoinment             = cancelAppoinment;
        vm.getAppointmentDateAndTime    = getAppointmentDateAndTime;
        vm.getClinicTiming              = getClinicTiming;
        $scope.appoinmentCancel         = appoinmentCancel;
        vm.checkClinicTiming            = checkClinicTiming;
        vm.getPatientReports            = getPatientReports;

      /*get clinic timing */
     function getClinicTiming(obj){
        if(obj){
             vm.data.date.open   = {};
              vm.data.date.close  = {};
              var data = JSON.parse(vm.sendData.clinic.clinicTiming);
              if(checkClinicTiming(obj)){
              angular.forEach(data,function(value,key){
                   if(value.day == vm.data.date.days[obj.getDay()]){
                      vm.data.date.open  = value.open;
                      vm.data.date.close = value.close;
                      toastr.info("Clinic Timing:"+vm.data.date.open+'-'+vm.data.date.close);
                     }
              });
             }else{
              toastr.error("Clinic Off");
            }
        }
      }

      /*cancel Appoinment*/
      function cancelAppoinment(obj){
        $scope.appointmentCancelData = obj;
        ngDialog.open({
          templateUrl : "assets/shared/template/directive/cancelAppoinment.html",
          scope       : $scope
        });
      }

      /*get service details*/
     function getServiceDetails(clinic,speciality,doctor){
        var userId      =  vm.data.userDetails.id;
        if(clinic && speciality && doctor){
           vm.data.serviceErrorMsg    = '';
           dashboardservices.getServiceData(clinic,speciality,doctor).then(function(response){
              if(response.data.data.status == 'success'){
                vm.data.serviceDetails =  response.data.data.message;
              }else if(response.data.data.status == 'error'){
                vm.data.serviceErrorMsg = response.data.data.message;
              }
            });
        }else{
          vm.sendData.service         = '';
          vm.data.serviceErrorMsg    = '';
          vm.data.serviceDetails      = [];
        }
    }



        /*appointment date engages by doctor*/
      function findAppointment(obj){
        obj    = moment(new Date(obj)).format('YYYY-MM-DD HH:mm:ss');
        if(vm.data.appointmentTime.indexOf(obj) != -1 || vm.data.appointmentEndTime.indexOf(obj) != -1 || vm.data.appointmentTimes.indexOf(obj) != -1){
          toastr.error(obj+' '+"Doctor is Engage");
           return true;
        }else{
          return false;
        }
      }

      function totalNumberOfitem(){
        return Math.ceil(vm.data.previousAppointment.length/vm.data.pageSize);
      }


        /* get clinic*/
        // function getClinicDetails(obj){
        //    if(obj){
        //          obj                   = angular.fromJson(obj);
        //          var data              = obj.id
        //          dashboardservices.getClinicData(data).then(function(response){
        //             if(response.data.data.status == 'success')
        //                 vm.data.clinicDetails         =  response.data.data.message;
        //             });
        //          angular.forEach(vm.data.specialityDetails,function(value,key){
        //           if(data == value.id){
        //             vm.data.serviceDetails = (value.services);
        //           }
        //        });

        //             }else{
        //                   vm.data.doctorDetails = [];
        //                   vm.sendData.doctor    = '';
        //                   vm.data.clinicDetails = [];
        //                   vm.sendData.clinic    = '';
        //                   vm.sendData.service   = '';
        //                   vm.data.serviceDetails= [];
        //                   vm.data.doctorErrorMsg= '';
        //                   vm.data.clinicErrorMsg= '';
        //       }
        // }


       /*get doctor details*/
         function getDoctorDetails(Specialityobj,Clinicobj){
          if(Specialityobj && Clinicobj){
             vm.data.doctorErrorMsg       = '';
             vm.data.serviceErrorMsg      = '';
             var Clinicdata               = Clinicobj.id;
             var Specialitydata           = Specialityobj.id;
               dashboardservices.getDoctorData(Specialitydata,Clinicdata).then(function(response){
                if(response.data.data.status == 'success'){
                       vm.data.doctorDetails         =  response.data.data.message;
                       if(vm.data.doctorDetails.length > 0){
                            angular.forEach(vm.data.doctorDetails,function(value,key){
                              value.UserDes = '';
                              value.UserDes =  'Dr'+' '+value.username;
                            });
                          }
                      }
                  if(response.data.data.status == 'error'){
                        vm.data.doctorErrorMsg         = response.data.data.message;
                  }
                });
                }else{
                      vm.sendData.doctor         = '';
                      vm.sendData.service        = '';
                      vm.data.doctorErrorMsg     = '';
                      vm.data.serviceErrorMsg    = '';
                      vm.data.doctorDetails      = [];
                      vm.data.serviceDetails     = [];
                 }
              }

      /*make an appointment*/
      function makeAnAppointment(obj,minute){
        console.log(obj);
          //Completed Time Restriction //changes made by Nishanth
          var appStarts = moment(obj.appointmentStart).format("HH:mm");
          var appStartDate = moment(obj.appointmentStart).format("YYYY-MM-DD");
          var currDate = moment(new Date()).format("YYYY-MM-DD");
          var currTime = moment(new Date()).format("HH:mm");
          var currTimeMer = moment(new Date()).format("HH:mm a");

          //Appointment booking completed time restriction
          if(appStartDate == currDate){
            // alert("success");
            if(appStarts < currTime){
              // alert("success");
              toastr.error("Current Time is "+currTimeMer+", Appointment have to be created after "+currTimeMer+" not before that, Thank You");
              return false;
            }

          }
        // return false;
        vm.data.submitted            = true;
        if(obj.appointmentStart != undefined && obj.speciality != undefined && obj.clinic !=undefined && obj.doctor != undefined && obj.reason != undefined && obj.service != undefined){
           vm.data.getTiming           =  moment(new Date(obj.appointmentStart)).format('HH:mm:ss');
          if(vm.checkClinicTiming(obj.appointmentStart)){
              if(vm.data.date.open <= vm.data.getTiming  && vm.data.date.close >= vm.data.getTiming){
                  var sendData                 = {};
                  sendData.reason              = obj.reason;
                  sendData.specaility          = obj.speciality;
                  // sendData.appointmentStart   = moment(new Date(obj.appointmentStart)).format('YYYY-MM-DD HH:mm:ss');
                  sendData.appointmentStart    = obj.appointmentStart;
                  sendData.specialityId        = obj.speciality.id;
                  sendData.clinicId            = obj.clinic.id;
                  sendData.doctorId            = obj.doctor.id;
                  sendData.serviceId           = obj.service.id;
                  sendData.serviceTime         = obj.service.mins;
                  sendData.patientId           = vm.data.userDetails.id;
                  sendData.userId              = sendData.patientId;
                  sendData.endsAt              = sendData.appointmentStart;
                  sendData.appointmentEnd      = vm.dateAdd(vm.sendData.appointmentStart, 'minute',minute);
                  sendData.startDate           = moment(obj.appointmentStart).format("YYYY-MM-DD");
                  sendData.startTime           = moment(obj.appointmentStart).format("H:mm:ss");
                  sendData.endDate             = moment(obj.appointmentStart).format("YYYY-MM-DD");
                  sendData.endTime             = moment(sendData.appointmentEnd).format("H:mm:ss");
                  sendData.createdBy           = 'patient';
                  sendData.type                = 'patient';
                  sendData.isview              = '0';
                  sendData.fromdevice          = '1';
                  vm.data.doctorEngage         = vm.findAppointment(vm.sendData.appointmentStart);
                  // console.log(sendData);return false;
                // sendData.appointmentEnd      = moment(new Date(sendData.appointmentEnd)).format('YYYY-MM-DD HH:mm:ss');
                  if(vm.data.doctorEngage != true){
                    // var saveData     = angular.toJson(sendData);
                    dashboardservices.makeAppointment(sendData).then(function(response){
                      if(response.data.data.status == 'success'){
                        toastr.success("Appointment Created Successfully");
                        vm.sendData                  = [];
                        $state.reload();
                      }else{
                        toastr.error("Appointment Not Created");
                      }
                    });
                  }else{
                    toastr.error("your Appointment Time is Doctor Engages ");
                    vm.data.doctorEngage = false;
                  }
                }else{
                  toastr.error("Clinic Timing:"+vm.data.date.open+'-'+vm.data.date.close);
                }
              }else{
                toastr.error("Clinic Off");
              }
        }
      }

     /* check appointment date for doctor*/
      function checkAppointmentDate(){
       vm.data.appointmentTime = [];
        vm.data.appointmentEndTime = [];
        vm.data.appointmentTimes = [];
        if(vm.sendData.doctor){
           var clinicId          = vm.sendData.clinic.id;
           var doctorId          = vm.sendData.doctor.id;
           dashboardservices.getAppointment(clinicId,doctorId).then(function(response){
              vm.data.checkAppointment = response.data.data.message;
              angular.forEach(vm.data.checkAppointment,function(value,key){

                var startDateValue  =   value.startDate +' '+value.startTime;
                var endDateValue    =   value.endDate+' '+value.endTime;


                var startDateMoment = moment(new Date(startDateValue)).format('YYYY-MM-DD HH:mm:ss');
                var endDateMoment = moment(new Date(endDateValue)).format('YYYY-MM-DD HH:mm:ss');


                var startDateMili = new Date(startDateMoment).getTime();
                for(var i=0;startDateMili < new Date(endDateMoment).getTime();i++){
                        var a       =   startDateMili+60000;
                        var startDateTime = moment(new Date(a)).format('HH:mm:ss');
                        vm.data.appointmentTimes.push(value.startDate +' '+startDateTime);
                         startDateMili = startDateMili+60000;
                }

              vm.data.appointmentTime.push(value.startDate +' '+value.startTime);
              vm.data.appointmentEndTime.push(value.endDate+' '+value.endTime);

          });
        });
        }
      }

      function dateAdd(date, interval, units) {
            var ret = new Date(date); //don't change original date
            switch(interval.toLowerCase()) {
              case 'year'   :  ret.setFullYear(ret.getFullYear() + units);  break;
              case 'quarter':  ret.setMonth(ret.getMonth() + 3*units);  break;
              case 'month'  :  ret.setMonth(ret.getMonth() + units);  break;
              case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
              case 'day'    :  ret.setDate(ret.getDate() + units);  break;
              case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
              case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
              case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
              default       :  ret = undefined;  break;
           }
            return ret;
        }



        vm.setTab = function (tabId) {
            vm.tab = tabId;
        };

        vm.isSet = function (tabId) {
            return vm.tab === tabId;
        };

        function onpageLoad(){
          if($stateParams.data == 'v1'){
            $location.hash($stateParams.data);
            $anchorScroll();
          }
           var sendData         = vm.data.userDetails.id;
           appointmentService.getAppointmentDetails(sendData).then(function(response){ //Get Appointment Details
              if(response.data.data.status == 'success'){
                vm.data.appointment     = response.data.data.message;
                vm.data.additionalInfo  = response.data.data.additionalInfo;
                if(_.isEmpty(vm.data.additionalInfo)){                                  // to check patient details is empty
                  vm.data.patientAhead  = 0;
                }
                vm.appointmentCalc();
              }
          });

          //Get Clinic Details for patinet
          dashboardservices.getClinic(sendData).then(function(response){
             if(response.data.data.status == 'success'){
                vm.data.clinicDetails = response.data.data.message;
             }
          });
        }

        function appointmentCalc(){
            vm.data.currentTime             = new Date();
            vm.data.currentAppointment      = [];
            vm.data.previousAppointment     = [];
            angular.forEach(vm.data.appointment,function(value,key){
              if(Date.parse(value.appointmentStart) >= (vm.data.currentTime) && value.status == 'book'){
                     vm.data.currentAppointment.push(value);
              }else if(value.status == 'checkOut'){
                      vm.data.previousAppointment.push(value);
              }
            });
              vm.data.currentAppointment.sort(function(a,b){
                  return Date.parse(a.appointmentStart) - Date.parse(b.appointmentStart)
              });
              vm.getAppointmentDateAndTime(vm.data.currentAppointment);

        }

        function getAppointmentDateAndTime(obj){
            if(obj.length > 0){
                 vm.data.currentAppointmentDate    = moment(new Date( obj[0].appointmentStart)).format("D,MMM YYYY");
                 vm.data.currentAppointmentTime    = moment(new Date( obj[0].appointmentStart)).format("h:mma");
                 if(vm.data.additionalInfo.length > 0){
                    angular.forEach(vm.data.additionalInfo,function(value,key){
                      if(_.keys(value) == obj[0].clinicId){
                       var data             = _.values(value);
                       vm.data.patientAhead = angular.fromJson(data[0]);
                        return false;
                      }
                    });
                 }
              }
        }

        //get Specilaity for clinic
     function getSpecailityDetails(obj){
       vm.data.clinicAvaliable       = [];
      if(obj){
         var data = obj;
         vm.data.specialityErrorMsg = '';
         vm.data.doctorErrorMsg     = '';
         vm.data.serviceErrorMsg    = '';
         // vm.data.clinicErrorMsg     = '';
          dashboardservices.getSpecialityData(data).then(function(response){
            if(response.data.data.status == 'success'){
               vm.data.specialityDetails = response.data.data.message;
               var data = JSON.parse(vm.sendData.clinic.clinicTiming);
                angular.forEach(data,function(value,key){
                    vm.data.clinicAvaliable.push(vm.data.date.days.indexOf(value.day));
                });
            }else{
              vm.data.specialityErrorMsg = response.data.data.message;
            }
        });
      }else{
        // vm.sendData.clinic         = '';
        vm.sendData.doctor         = '';
        vm.sendData.service        = '';
        vm.sendData.speciality     = '';
        // vm.data.clinicErrorMsg     = '';
        vm.data.specialityErrorMsg = '';
        vm.data.doctorErrorMsg     = '';
        vm.data.serviceErrorMsg    = '';
        vm.data.serviceDetails     = [];
        vm.data.doctorDetails      = [];
        vm.data.specialityDetails  = [];
      }
    }

    function appoinmentCancel(reason,obj){
      var data      = {};
      data.id       = obj.id;
      data.reason   = reason;
      data.clinicId = obj.clinicId;
      data.status   = 'cancel';
      appointmentService.cancelAppointment(data).then(function(response){
         if(response.data.data.status == 'success'){
              toastr.success("Appointment Canceled");
              var index = vm.data.currentAppointment.indexOf(obj);
              vm.data.currentAppointment.splice(index,1);
              vm.getAppointmentDateAndTime(vm.data.currentAppointment);
              ngDialog.close();
         }
      });
    }

      function checkClinicTiming(obj){
          if(vm.sendData.clinic && obj){
            var data           = false;
            var clinicTiming   = JSON.parse(vm.sendData.clinic.clinicTiming);
            if(clinicTiming[obj.getDay()].clinicOpen){
                data =  true;
            }
          }
          return data;
        }

        /*for date disabled */
        function dateDisabled(date,mode){
         if(vm.data.clinicAvaliable.indexOf(date.getDay()) == -1){
              return (mode === 'day' && date.getDay());
          }
        }

        function getPatientReports(data){
          var id            =   vm.data.userDetails.id;
          var appointmentId =   data.id;
          var clinicId      =   data.clinicId;
          var  sendData     =   {};
          recordsServices.getReport(id,appointmentId,clinicId).then(function(resp){
              if(resp.data.data.status == 'success'){
                    sendData   = resp.data.data.message[appointmentId];
                    $state.go('myrecorddetails',{
                      data:sendData
                });             
              }
          });
        }


        vm.onpageLoad();

    };
 })();
