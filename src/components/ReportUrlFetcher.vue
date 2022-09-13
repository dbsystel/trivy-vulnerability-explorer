<template>
  <fragment>
    <v-text-field
      v-model="url"
      label="Url"
      class="mx-2"
      hide-details
    ></v-text-field>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" icon v-bind="attrs" v-on="on">
          <v-icon aria-label="Add Authorization Header"
            >mdi-shield-lock
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">Authorization</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="headerName"
                  label="Header Name"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="headerValue"
                  label="Header Value"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                The data will be stored in the localStorage of your Browser and
                is added as a header to the fetch call. If you want to fetch a
                report from a
                <a
                  href="https://docs.gitlab.com/ee/api/job_artifacts.html#download-a-single-artifact-file-by-job-id"
                  target="_blank"
                  >GitLab Job</a
                >
                , you need to add the PRIVATE-TOKEN header and set it to a
                <a
                  href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html"
                  >personal access token</a
                >
                with the scope read_api.
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="saveAuthorization">
            Save&Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn
      :loading="this.state === 'loading'"
      :disabled="this.state === 'loading' || !url"
      @click="fetchReportFromUrl"
      class="mx-2"
      :color="this.state === 'error' ? 'error' : 'primary'"
    >
      Fetch
    </v-btn>
  </fragment>
</template>

<script lang="ts">
import Vue from "vue"
import VueFileAgent from "vue-file-agent"
import { Component } from "vue-property-decorator"
import { Fragment } from "vue-frag"
// Define the props by using Vue's canonical way.
const ReportUrlFetcherProps = Vue.extend({
  props: {
    onNewReport: Function,
    presetUrl: String,
  },
})
Vue.use(VueFileAgent)
@Component({
  components: { Fragment },
})
export default class ReportUrlFetcher extends ReportUrlFetcherProps {
  private url = ""
  private state = "ready"
  private dialog = false
  private headerName = ""
  private headerValue = ""
  mounted(): void {
    this.loadAuthorization()
    if (this.presetUrl) {
      this.url = this.presetUrl
      this.fetchReportFromUrl()
    }
  }
  public loadAuthorization(): void {
    this.headerName = localStorage.getItem("headerName") || ""
    this.headerValue = localStorage.getItem("headerValue") || ""
  }
  public saveAuthorization(): void {
    localStorage.setItem("headerName", this.headerName)
    localStorage.setItem("headerValue", this.headerValue)
    this.dialog = false
  }

  public async fetchReportFromUrl(): Promise<void> {
    if (this.url) {
      this.state = "loading"
      const headers: Record<string, string> = {}
      if (this.headerName && this.headerValue) {
        headers[this.headerName] = this.headerValue
      }
      try {
        const response = await fetch(this.url, { headers })
        this.state = "ready"
        if (response.ok) {
          const report = await response.json()
          if (!report) {
            throw new Error("Response from URL doesn't look like JSON")
          }
          this.onNewReport(report)
          return
        }
      } catch (error) {
        console.error(error)
      }
      this.state = "error"
    }
  }
}
</script>
