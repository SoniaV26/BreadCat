package com.breadgroup.BreadCat;

public class ResponseData {
	private boolean success;
	private String error;
	
	public ResponseData(boolean success, String error) {
		this.success = success;
		this.error = error;
	}

	@Override
	public String toString() {
		return "ResponseData [success=" + success + ", error=" + error + "]";
	}
	
	//Standard getters/setters

	public boolean isSuccess() {
		return success;
	}

	public String getError() {
		return error;
	}

	public void setSuccess(boolean success) {
		this.success = success;
	}

	public void setError(String error) {
		this.error = error;
	}
}
