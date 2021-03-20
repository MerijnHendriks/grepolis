// Reference:
// https://docs.microsoft.com/en-us/dotnet/api/system.net.http.httpclienthandler.servercertificatecustomvalidationcallback

using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using Game.Common.Constants;

namespace Game.Common.Utils
{
	public static class HttpRequest
	{
		/// <summary>
		/// Send a request to remote endpoint and optionally receive a response body.
		/// </summary>
		public static byte[] Send(string url, HttpMethod method, byte[] body = null, string mime = null, Dictionary<string, string> headers = null)
		{
			Uri uri = new Uri(url);
			HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);

			if (uri.Scheme == "https")
			{
				ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
				request.ServerCertificateValidationCallback = delegate { return true; };
			}

			request.Method = HttpConstants.GetMethodName(method);

			if (headers != null)
			{
				foreach (KeyValuePair<string, string> item in headers)
				{
					request.Headers.Add(item.Key, item.Value);
				}
			}

			if (method != HttpMethod.Get && method != HttpMethod.Head && body != null)
			{
				request.ContentType = HttpConstants.IsValidMime(mime) ? mime : "application/octet-stream";
				request.ContentLength = body.Length;

				using (Stream stream = request.GetRequestStream())
				{
					stream.Write(body, 0, body.Length);
				}
			}

			WebResponse response = request.GetResponse();

			try
			{
				using (MemoryStream ms = new MemoryStream())
				{
					response.GetResponseStream().CopyTo(ms);
					return ms.ToArray();
				}
			}
			catch
			{
				return null;
			}
		}
	}
}
