import { Location } from '@angular/common';
import { AppHeaderService } from './../../../services/app-header.service';
import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import {
    Environment,
    ImpressionType,
    PageId
} from '@app/services/telemetry-constants';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouterLinks } from '@app/app/app.constant';
import { CsGroupAddableBloc } from '@project-sunbird/client-services/blocs';
import { CorrelationData } from '@project-sunbird/sunbird-sdk';


@Component({
    selector: 'add-activity-to-group',
    templateUrl: 'add-activity-to-group.page.html',
    styleUrls: ['./add-activity-to-group.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AddActivityToGroupPage implements OnInit, OnDestroy {

    corRelationList: Array<CorrelationData>;
    unregisterBackButton: Subscription;
    headerObservable: any;
    supportedActivityList: Array<any>;
    groupId: string;
    activityList;
    private csGroupAddableBloc: CsGroupAddableBloc;

    constructor(
        private router: Router,
        public headerService: AppHeaderService,
        private platform: Platform,
        private telemetryGeneratorService: TelemetryGeneratorService,
        private location: Location,
    ) {
        const extras = this.router.getCurrentNavigation().extras.state;
        if (extras) {
            this.corRelationList = extras.corRelation;
            this.supportedActivityList = extras.supportedActivityList;
            this.groupId = extras.groupId;
            this.activityList = extras.activityList;
        }
        this.csGroupAddableBloc = CsGroupAddableBloc.instance;
    }

    ngOnInit() {
        if (!this.csGroupAddableBloc.initialised) {
            this.csGroupAddableBloc.init();
        }
    }

    ionViewWillEnter() {
        this.headerObservable = this.headerService.headerEventEmitted$.subscribe(eventName => {
            this.handleHeaderEvents(eventName);
        });
        this.headerService.showHeaderWithBackButton();
        this.handleDeviceBackButton();
        this.telemetryGeneratorService.generateImpressionTelemetry(
            ImpressionType.VIEW,
            '',
            PageId.ADD_ACTIVITY_TO_GROUP,
            Environment.GROUP,
            undefined, undefined, undefined, undefined, this.corRelationList);
    }

    ionViewWillLeave() {
        this.headerObservable.unsubscribe();
        if (this.unregisterBackButton) {
            this.unregisterBackButton.unsubscribe();
        }
    }

    ngOnDestroy() {
        this.csGroupAddableBloc.dispose();
    }

    handleBackButton(isNavBack: boolean) {
        this.telemetryGeneratorService.generateBackClickedTelemetry(PageId.ACTIVITY_TOC,
            Environment.GROUP, isNavBack, undefined, this.corRelationList);
        this.location.back();
    }

    handleDeviceBackButton() {
        this.unregisterBackButton = this.platform.backButton.subscribeWithPriority(10, () => {
            this.handleBackButton(false);
        });
    }

    handleHeaderEvents($event) {
        switch ($event.name) {
            case 'back':
                this.handleBackButton(true);
                break;
        }
    }

    async search(data) {
        this.csGroupAddableBloc.updateState({
            pageIds:  [],
            groupId: this.groupId,
            params: {
                activityList: this.activityList,
                corRelation: this.corRelationList
            }
        }
        );
        this.router.navigate([RouterLinks.SEARCH], {
            state: {
                activityTypeData: data,
                source: PageId.GROUP_DETAIL,
                groupId: this.groupId,
                activityList: this.activityList,
                corRelation: this.corRelationList
            }
        });
    }

}